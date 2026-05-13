import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  getFriendlyAuthErrorMessage,
  sendVerificationEmail,
} from "../services/authService";
import { syncEmailVerification } from "../services/userService";

type VerifyState = "idle" | "checking" | "verified" | "not-verified";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<VerifyState>("idle");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [checkMessage, setCheckMessage] = useState("");

  const email =
    auth.currentUser?.email ||
    (typeof location.state?.email === "string" ? location.state.email : "");
  const source =
    typeof location.state?.source === "string" ? location.state.source : "signup";
  const resentOnLogin = location.state?.resentOnLogin === true;
  const nextPath =
    typeof location.state?.next === "string" && location.state.next.startsWith("/")
      ? location.state.next
      : "/questions";
  const headline = useMemo(() => {
    if (status === "verified") {
      return "Email verified.";
    }

    return "Check your inbox.";
  }, [status]);

  useEffect(() => {
    if (status !== "verified") return;

    const timeoutId = window.setTimeout(() => {
      navigate(nextPath);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [nextPath, status, navigate]);

  useEffect(() => {
    if (!resentOnLogin) return;

    setResendMessage(
      "Your account is not verified yet, so we sent a fresh verification email.",
    );
  }, [resentOnLogin]);

  const handleCheck = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login", {
        state: {
          next: nextPath,
        },
      });
      return;
    }

    setStatus("checking");
    setCheckMessage("");
    await user.reload();

    if (user.emailVerified) {
      await user.getIdToken(true);
      await syncEmailVerification(user.uid, true);
      setStatus("verified");
    } else {
      setStatus("not-verified");
      setCheckMessage(
        "We still cannot confirm the verification. Open the email and tap the link first, then try again.",
      );
    }
  };

  const handleResend = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login", {
        state: {
          next: nextPath,
        },
      });
      return;
    }

    try {
      setResending(true);
      setResendMessage("");
      await sendVerificationEmail(user, nextPath);
      setResendMessage(
        "A new verification email has been sent. Please also check spam or junk.",
      );
    } catch (error) {
      console.error("Resend verification error:", error);
      setResendMessage(getFriendlyAuthErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.24)] sm:p-10">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.28),transparent_58%)]" />
            <div className="relative">
              <div className="inline-flex rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                Verification
              </div>
              <h1 className="mt-5 max-w-md text-4xl font-semibold tracking-[-0.05em] sm:text-[3.35rem]">
                {headline}
              </h1>
              <p className="mt-4 max-w-md text-[1.02rem] leading-7 text-white/72">
                {status === "verified"
                  ? "Your account is ready. We are taking you into the question hub now."
                  : "Open the verification email we sent, confirm your address, and come back here when you are ready."}
              </p>

              <div className="mt-8 space-y-3">
                <div className="rounded-[1.7rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    Destination
                  </div>
                  <div className="mt-2 text-sm font-medium text-white/88">
                    {email || "Your account email"}
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    Tips
                  </div>
                  <div className="mt-2 space-y-2 text-sm leading-6 text-white/72">
                    <p>Check spam, junk, and promotions if you do not see it.</p>
                    <p>
                      {source === "signup"
                        ? "New accounts sometimes take a moment for the first verification email to arrive."
                        : "If you signed in on another device, refresh this page after verifying there."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2.5rem] border border-slate-200/80 bg-white/86 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Status
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.6rem]">
                  {status === "verified"
                    ? "You are all set."
                    : "Finish the last step."}
                </h2>
              </div>

              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl text-xl ${
                  status === "verified"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {status === "verified" ? "✓" : "✉"}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={handleCheck}
                className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {status === "checking" ? "Checking..." : "I’ve verified my email"}
              </button>

              {status !== "verified" && (
                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  {resending ? "Sending again..." : "Resend verification email"}
                </button>
              )}
            </div>

            {(checkMessage || resendMessage) && (
              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                {checkMessage || resendMessage}
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Step 1
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Open the email and tap the verification link.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Step 2
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Come back here and confirm so we can unlock your account.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
              <Link to="/" className="transition hover:text-slate-900">
                Back home
              </Link>
              <Link to="/login" className="transition hover:text-slate-900">
                Return to login
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
