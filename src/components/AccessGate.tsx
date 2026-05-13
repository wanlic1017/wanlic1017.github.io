import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { getPlanLabel } from "../config/access";
import { getModuleBySlugs } from "../data/subjects";
import { useAccessState } from "../hooks/useAccessState";
import { startCheckout } from "../services/checkoutService";

type AccessGateProps = {
  children: ReactNode;
  require: "materials";
  subjectSlug?: string;
  moduleSlug?: string;
};

export default function AccessGate({
  children,
  require,
  subjectSlug,
  moduleSlug,
}: AccessGateProps) {
  const [checkoutPending, setCheckoutPending] = useState(false);
  const access = useAccessState();
  const moduleData =
    subjectSlug && moduleSlug ? getModuleBySlugs(subjectSlug, moduleSlug) : null;
  const moduleName = moduleData?.module.title ?? "this module";
  const canBuyModule = Boolean(subjectSlug && moduleSlug);

  if (access.loading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white/86 p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        <p className="mt-4 text-sm text-slate-500">Checking your access...</p>
      </div>
    );
  }

  const isAllowed =
    require === "materials"
      ? subjectSlug && moduleSlug
        ? access.canAccessModule(subjectSlug, moduleSlug)
        : access.materialsAccess
      : false;
  if (isAllowed) {
    return <>{children}</>;
  }

  const handleModuleCheckout = async () => {
    if (!subjectSlug || !moduleSlug) return;

    try {
      setCheckoutPending(true);
      await startCheckout({
        purchaseType: "module",
        subjectSlug,
        moduleSlug,
      });
    } catch (error) {
      console.error("Module checkout failed:", error);
      alert("Failed to start checkout. Please try again.");
      setCheckoutPending(false);
    }
  };

  return (
    <div className="rounded-[2.3rem] border border-slate-200 bg-white/92 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-10">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        Materials Access
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.6rem]">
        Unlock {moduleName}.
      </h2>
      <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-slate-600">
        Get the notes, model answers, and mind maps for this module in one
        study flow. Review the material first, zoom through the mind map, then
        practise questions while it is still fresh.
      </p>
      <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Current plan: {getPlanLabel(access.plan)}.
        {access.signedIn
          ? " Upgrade to Premium Materials or this module to continue."
          : " Sign in, then choose a plan with materials access."}
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        {access.signedIn && canBuyModule ? (
          <button
            type="button"
            onClick={handleModuleCheckout}
            disabled={checkoutPending}
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {checkoutPending ? "Opening checkout..." : "Get module access"}
          </button>
        ) : (
          <Link
            to="/login"
            state={{
              next:
                subjectSlug && moduleSlug
                  ? `/${subjectSlug}/${moduleSlug}`
                  : "/account",
            }}
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign in
          </Link>
        )}
        <Link
          to="/questions"
          className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          Go to practice
        </Link>
      </div>
    </div>
  );
}
