import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import {
  getFriendlyAuthErrorMessage,
  normalizeEmail,
  register,
  requestPasswordReset,
  sendVerificationEmail,
} from "../services/authService";
import {
  syncEmailVerification,
} from "../services/userService";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [showSignup, setShowSignup] = useState(
    searchParams.get("mode") === "signup",
  );
  const nextPath =
    typeof location.state?.next === "string" && location.state.next.startsWith("/")
      ? location.state.next
      : "/questions";

  // ==============================
  // 🔐 LOGIN
  // ==============================
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );
      const user = userCredential.user;

      await user.reload();

      if (!user.emailVerified) {
        try {
          await sendVerificationEmail(user, nextPath);
        } catch (verificationError) {
          console.error("Verification resend on login failed:", verificationError);
        }

        navigate("/verify-email", {
          state: {
            email: user.email || normalizedEmail,
            source: "login",
            next: nextPath,
            resentOnLogin: true,
          },
        });
        return;
      }

      await syncEmailVerification(user.uid, true);
      navigate(nextPath);
    } catch (err: unknown) {
      console.error("Login error:", err);
      alert(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 🆕 SIGN UP
  // ==============================
  const handleSignupSubmit = async () => {
    if (
      !signupFirstName.trim() ||
      !signupLastName.trim() ||
      !signupEmail.trim() ||
      !signupPassword.trim() ||
      !signupConfirmPassword.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const normalizedSignupEmail = normalizeEmail(signupEmail);

      await register(normalizedSignupEmail, signupPassword, {
        firstName: signupFirstName.trim(),
        lastName: signupLastName.trim(),
        phone: signupPhone.trim() || null,
      }, nextPath);

      setShowSignup(false);

      setSignupFirstName("");
      setSignupLastName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      setSignupPhone("");

      navigate("/verify-email", {
        state: {
          email: normalizedSignupEmail,
          source: "signup",
          next: nextPath,
        },
      });
    } catch (err: unknown) {
      console.error("Signup error:", err);
      alert(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      setResetMessage("Please enter your email address.");
      return;
    }

    try {
      setResetLoading(true);
      setResetMessage("");
      await requestPasswordReset(resetEmail.trim());
      setResetMessage(
        "Password reset email sent. Open the link in your inbox to set a new password.",
      );
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      setResetMessage(getErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-semibold text-white text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-slate-400 text-center mb-8 text-sm">
          Log in to continue your learning journey
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleLogin}
            className="preserve-light-mode w-full rounded-xl bg-white py-3 font-medium !text-slate-950 transition hover:opacity-90"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={() => setShowSignup(true)}
            className="w-full rounded-xl border border-white/10 bg-white/10 py-3 !text-white transition hover:bg-white/20"
          >
            Create Account
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForgotPassword(true);
            setResetEmail(email.trim());
            setResetMessage("");
          }}
          className="mt-4 w-full text-sm text-slate-300 transition hover:text-white"
        >
          Forgot your password?
        </button>
      </div>

      {showSignup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowSignup(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSignup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-semibold text-white text-center mb-2">
              Create Account
            </h2>
            <p className="text-slate-400 text-center mb-6 text-sm">
              Enter your details below to get started
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name *"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={signupFirstName}
                onChange={(e) => setSignupFirstName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Last Name *"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={signupLastName}
                onChange={(e) => setSignupLastName(e.target.value)}
              />

              <input
                type="email"
                placeholder="Email *"
                className="md:col-span-2 w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password *"
                className="md:col-span-2 w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="Confirm Password *"
                className="md:col-span-2 w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
              />

              <input
                type="tel"
                placeholder="Phone Number (optional)"
                className="md:col-span-2 w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleSignupSubmit}
              className="preserve-light-mode mt-6 w-full rounded-xl bg-white py-3 font-medium !text-slate-950 transition hover:opacity-90"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </div>
      )}

      {showForgotPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowForgotPassword(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-white">Reset password</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              We will send you a secure link to choose a new password on the site.
            </p>

            <input
              type="email"
              placeholder="Email"
              className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />

            {resetMessage ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
                {resetMessage}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="preserve-light-mode w-full rounded-xl bg-white py-3 font-medium !text-slate-950 transition hover:opacity-90"
              >
                {resetLoading ? "Sending..." : "Send reset link"}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 !text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
