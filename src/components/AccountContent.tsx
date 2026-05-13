import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { logout } from "../services/authService";
import { openBillingPortal } from "../services/billingService";
import { startCheckout } from "../services/checkoutService";
import { getAccountPlanState } from "../services/haerengaBackend";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getPlanAdminHint,
  getPlanLabel,
  type UserPlan,
} from "../config/access";

export default function AccountContent({ onClose }: { onClose?: () => void }) {
  const [plan, setPlan] = useState<UserPlan | "loading">("loading");
  const [checkoutPending, setCheckoutPending] = useState<
    "practice" | "full" | null
  >(null);
  const [billingPending, setBillingPending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;
  const nextPath = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!user) return;

    let active = true;

    const loadPlan = async () => {
      try {
        const data = await getAccountPlanState();

        if (!active) return;

        setPlan(data.plan);
      } catch {
        if (!active) return;

        setPlan("free");
      }
    };

    void loadPlan();

    return () => {
      active = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Sign in or create an account to manage access.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              onClose?.();
              navigate("/login", {
                state: {
                  next: nextPath,
                },
              });
            }}
            className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              onClose?.();
              navigate("/login?mode=signup", {
                state: {
                  next: nextPath,
                },
              });
            }}
            className="preserve-light-mode w-full rounded-xl border border-slate-300 bg-white py-3 text-sm font-medium !text-slate-900 transition hover:bg-slate-50 dark:border-white/20 dark:bg-white"
          >
            Create account
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();

      // close modal first (clean UX)
      onClose?.();

      // redirect
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setBillingPending(true);
      await openBillingPortal();
    } catch (err) {
      console.error("Billing portal error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to open subscription manager.",
      );
      setBillingPending(false);
    }
  };

  const handleUpgrade = async (purchaseType: "practice" | "full") => {
    try {
      setCheckoutPending(purchaseType);
      await startCheckout({ purchaseType });
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to start checkout.");
      setCheckoutPending(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Manage your subscription and access
        </p>
      </div>

      {/* Plan Card */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/20 dark:bg-slate-950/70">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-300">Current Plan</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {plan === "loading"
                ? "Loading..."
                : getPlanLabel(plan)}
            </div>
            {plan !== "loading" && (
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                {getPlanAdminHint(plan)}
              </div>
            )}
          </div>

          {plan !== "loading" && plan !== "free" && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 [&>*]:transition-all [&>*]:duration-200">
        {plan === "free" ? (
          <>
            <button
              onClick={() => handleUpgrade("practice")}
              disabled={checkoutPending !== null}
              className="
  w-full rounded-xl bg-black py-3 text-sm font-medium text-white

  cursor-pointer

  transform transition-all duration-200 ease-out
  hover:scale-[1.03] hover:-translate-y-0.5
  hover:bg-slate-800 hover:shadow-lg
  active:scale-95
  disabled:cursor-not-allowed disabled:opacity-70
"
            >
              {checkoutPending === "practice"
                ? "Opening checkout..."
                : "Upgrade to Practice Pro"}
            </button>
            <button
              onClick={() => handleUpgrade("full")}
              disabled={checkoutPending !== null}
              className="
  w-full rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-800
  dark:border-white/30 dark:text-white

  cursor-pointer

  transform transition-all duration-200 ease-out
  hover:scale-[1.03] hover:-translate-y-0.5
  hover:bg-slate-100 hover:shadow-md dark:hover:bg-white/10
  active:scale-95
  disabled:cursor-not-allowed disabled:opacity-70
"
            >
              {checkoutPending === "full"
                ? "Opening checkout..."
                : "Get Premium Materials"}
            </button>
          </>
        ) : (
          <button
            onClick={handleManageSubscription}
            disabled={billingPending}
            className="
  w-full rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-800
  dark:border-white/30 dark:text-white

  cursor-pointer

  transform transition-all duration-200 ease-out
  hover:scale-[1.03] hover:-translate-y-0.5
  hover:bg-slate-100 hover:shadow-md dark:hover:bg-white/10
  active:scale-95
  disabled:cursor-not-allowed disabled:opacity-70
"
          >
            {billingPending ? "Opening billing..." : "Manage billing"}
          </button>
        )}

        {plan === "practice" || plan === "pro" ? (
          <button
            onClick={() => handleUpgrade("full")}
            disabled={checkoutPending !== null}
            className="
  w-full rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-800
  dark:border-white/30 dark:text-white

  cursor-pointer

  transform transition-all duration-200 ease-out
  hover:scale-[1.03] hover:-translate-y-0.5
  hover:bg-slate-100 hover:shadow-md dark:hover:bg-white/10
  active:scale-95
  disabled:cursor-not-allowed disabled:opacity-70
"
          >
            {checkoutPending === "full"
              ? "Opening checkout..."
              : "Add Premium Materials"}
          </button>
        ) : null}

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="
  w-full text-sm text-slate-500
  dark:text-slate-300

  cursor-pointer

  transition-all duration-200 ease-out
  hover:text-slate-800
  dark:hover:text-white
  hover:scale-[1.02]
  active:scale-95
"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
