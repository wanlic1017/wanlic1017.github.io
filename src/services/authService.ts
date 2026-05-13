import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { auth } from "../firebase";
import { ensureUserDocument, syncEmailVerification } from "./userService";
import { getAuthActionSettings } from "./authAction";

type RegisterProfile = {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

function getAuthErrorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

export function getFriendlyAuthErrorMessage(error: unknown) {
  const code = getAuthErrorCode(error);

  if (code === "auth/email-already-in-use") {
    return "That email is already in use. Try logging in instead, then resend the verification email if needed.";
  }

  if (code === "auth/weak-password") {
    return "Password should be at least 6 characters.";
  }

  if (code === "auth/too-many-requests") {
    return "Firebase has temporarily limited email requests for this account. Please wait a few minutes, then try resend verification again.";
  }

  if (code === "auth/unauthorized-continue-uri") {
    return "Firebase blocked the verification link domain. Add this site domain to Firebase Authentication > Settings > Authorized domains.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export const sendVerificationEmail = async (user: User, nextPath?: string) => {
  auth.languageCode = "en";
  await sendEmailVerification(user, getAuthActionSettings(nextPath));
};

// ✅ REGISTER
export const register = async (
  email: string,
  password: string,
  profile: RegisterProfile = {},
  nextPath?: string,
) => {
  const normalizedEmail = normalizeEmail(email);
  const cred = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );

  if (cred.user) {
    await ensureUserDocument(
      cred.user.uid,
      cred.user.email || normalizedEmail,
      profile,
    );
    await sendVerificationEmail(cred.user, nextPath);
  }

  return cred;
};

// ✅ LOGIN
export const login = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  if (cred.user) {
    // 🔄 reload to get latest verification status
    await cred.user.reload();

    // ❌ block unverified users
    if (!cred.user.emailVerified) {
      await signOut(auth);
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    // ✅ sync verification to Firestore
    await syncEmailVerification(cred.user.uid, cred.user.emailVerified);
  }

  return cred;
};

// ✅ LOGOUT
export const logout = async () => {
  return await signOut(auth);
};

export const requestPasswordReset = async (email: string) => {
  auth.languageCode = "en";
  await sendPasswordResetEmail(
    auth,
    normalizeEmail(email),
    getAuthActionSettings(),
  );
};
