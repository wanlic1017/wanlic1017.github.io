import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUserDocument } from "./userService";

// ✅ REGISTER
export const register = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  if (userCredential.user) {
    await sendEmailVerification(userCredential.user);

    // create Firestore user
    await createUserDocument(
      userCredential.user.uid,
      userCredential.user.email || ""
    );
  }

  return userCredential;
};

// ✅ LOGIN (THIS WAS MISSING)
export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// ✅ LOGOUT
export const logout = async () => {
  return await signOut(auth);
};