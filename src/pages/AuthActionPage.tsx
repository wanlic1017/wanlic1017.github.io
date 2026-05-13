import { useEffect, useMemo, useState } from "react";
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { auth } from "../firebase";
import { syncEmailVerification } from "../services/userService";

type ActionState = "loading" | "success" | "error" | "ready";

const PASSWORD_MIN_LENGTH = 6;

export default function AuthActionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<ActionState>("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitPending, setSubmitPending] = useState(false);

  const mode = searchParams.get("mode") ?? "";
  const oobCode = searchParams.get("oobCode") ?? "";
  const continueUrl = searchParams.get("continueUrl") ?? "";
  const directNextPath = searchParams.get("next") ?? "";
  const nextPath = useMemo(() => {
    const getSafePath = (value: string | null) => {
      if (!value?.startsWith("/") || value.startsWith("//")) {
        return "";
      }

      return value;
    };

    const safeDirectPath = getSafePath(directNextPath);

    if (safeDirectPath) {
      return safeDirectPath;
    }

    if (continueUrl) {
      try {
        const parsedContinueUrl = new URL(continueUrl);
        const safeContinuePath = getSafePath(
          parsedContinueUrl.searchParams.get("next"),
        );

        if (safeContinuePath) {
          return safeContinuePath;
        }
      } catch {
        return "/questions";
      }
    }

    return "/questions";
  }, [continueUrl, directNextPath]);

  const title = useMemo(() => {
    if (mode === "resetPassword") {
      if (status === "ready") return "Choose a new password";
      if (status === "success") return "Password updated";
      return "Reset your password";
    }

    if (status === "success") {
      return "Email verified";
    }

    return "Confirming your email";
  }, [mode, status]);

  useEffect(() => {
    let cancelled = false;

    const runAction = async () => {
      if (!oobCode || !mode) {
        const currentUser = auth.currentUser;

        if (currentUser) {
          await currentUser.reload();

          if (currentUser.emailVerified) {
            await currentUser.getIdToken(true);
            await syncEmailVerification(currentUser.uid, true);

            if (!cancelled) {
              navigate(nextPath, { replace: true });
            }
            return;
          }
        }

        if (!cancelled) {
          navigate("/verify-email", { replace: true });
        }
        return;
      }

      try {
        if (mode === "verifyEmail") {
          await applyActionCode(auth, oobCode);
          const currentUser = auth.currentUser;

          if (currentUser) {
            await currentUser.reload();
            await currentUser.getIdToken(true);
            await syncEmailVerification(currentUser.uid, true);
          }

          if (!cancelled) {
            setStatus("success");
          setMessage("Your email has been verified. We are taking you back now.");
          window.setTimeout(() => {
              navigate(nextPath, { replace: true });
            }, 1600);
          }
          return;
        }

        if (mode === "resetPassword") {
          const resetEmail = await verifyPasswordResetCode(auth, oobCode);

          if (!cancelled) {
            setEmail(resetEmail);
            setStatus("ready");
            setMessage("Enter your new password below.");
          }
          return;
        }

        if (mode === "recoverEmail") {
          const info = await checkActionCode(auth, oobCode);
          const restoredEmail = info.data.email ?? "";

          await applyActionCode(auth, oobCode);

          if (!cancelled) {
            setStatus("success");
            setMessage(
              restoredEmail
                ? `Your email has been restored to ${restoredEmail}.`
                : "Your email has been restored.",
            );
          }
          return;
        }

        if (!cancelled) {
          setStatus("error");
          setMessage("This action is not supported yet.");
        }
      } catch (error) {
        console.error("Auth action error:", error);

        if (!cancelled) {
          setStatus("error");
          setMessage(
            mode === "resetPassword"
              ? "This password reset link is invalid or has expired. Please request a new one."
              : "This verification link is invalid or has expired. Please request a new one.",
          );
        }
      }
    };

    void runAction();

    return () => {
      cancelled = true;
    };
  }, [mode, navigate, nextPath, oobCode]);

  const handlePasswordSubmit = async () => {
    if (!oobCode) {
      setStatus("error");
      setMessage("This password reset link is invalid.");
      return;
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setMessage("Your new password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Your passwords do not match.");
      return;
    }

    try {
      setSubmitPending(true);
      setMessage("");
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("success");
      setMessage("Your password has been updated. You can log in now.");
    } catch (error) {
      console.error("Confirm password reset error:", error);
      setStatus("error");
      setMessage("We could not reset your password. Please request a new reset link.");
    } finally {
      setSubmitPending(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
        <section className="w-full max-w-2xl rounded-[2.5rem] border border-slate-200/80 bg-white/88 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-10">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Account security
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-[3rem]">
            {title}
          </h1>

          <p className="mt-4 text-[1.02rem] leading-7 text-slate-600">
            {status === "loading"
              ? "Please wait while we process your secure link."
              : message}
          </p>

          {status === "loading" ? (
            <div className="mt-8 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          ) : null}

          {status === "ready" && mode === "resetPassword" ? (
            <div className="mt-8">
              <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Resetting password for {email}
              </div>

              <div className="mt-5 space-y-4">
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {submitPending ? "Updating..." : "Save new password"}
                </button>
              </div>
            </div>
          ) : null}

          {status === "success" ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {mode === "resetPassword" ? (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Go to login
                </button>
              ) : null}

              {mode === "resetPassword" ? (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Back to login
                </button>
              ) : null}
            </div>
          ) : null}

          {status === "error" ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/verify-email"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Verification help
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Back to login
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
