import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { getPlanAdminHint, getPlanLabel } from "../config/access";
import { subjects } from "../data/subjects";
import { useAccessState } from "../hooks/useAccessState";
import { logout } from "../services/authService";
import { openBillingPortal } from "../services/billingService";
import { startCheckout } from "../services/checkoutService";

type ModuleAccessItem = {
  subjectCode: string;
  subjectSlug: string;
  moduleSlug: string;
  moduleTitle: string;
  modulePrice: string;
  hasAccess: boolean;
};

function buildModuleAccessItems(
  canAccessModule: (subjectSlug: string, moduleSlug: string) => boolean,
): ModuleAccessItem[] {
  return subjects.flatMap((subject) =>
    subject.modules.map((module) => ({
      subjectCode: subject.code,
      subjectSlug: subject.slug,
      moduleSlug: module.slug,
      moduleTitle: module.title,
      modulePrice: module.price,
      hasAccess: canAccessModule(subject.slug, module.slug),
    })),
  );
}

export default function AccountPage() {
  const access = useAccessState();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkoutPending, setCheckoutPending] = useState<"practice" | "full" | null>(null);
  const [billingPending, setBillingPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const nextState = { next: `${location.pathname}${location.search}` };

  const moduleItems = useMemo(
    () => buildModuleAccessItems(access.canAccessModule),
    [access],
  );
  const unlockedItems = moduleItems.filter((item) => item.hasAccess);
  const questionHubActive = access.unlimitedPractice;
  const questionHubEndText = access.practiceSubscriptionCurrentPeriodEnd
    ? new Intl.DateTimeFormat("en-NZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(access.practiceSubscriptionCurrentPeriodEnd)
    : null;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const handleCheckout = async (purchaseType: "practice" | "full") => {
    try {
      setCheckoutPending(purchaseType);
      await startCheckout({ purchaseType });
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to start checkout. Please try again.");
      setCheckoutPending(null);
    }
  };

  const handleModuleCheckout = async (
    subjectSlug: string,
    moduleSlug: string,
  ) => {
    try {
      setCheckoutPending("full");
      await startCheckout({
        purchaseType: "module",
        subjectSlug,
        moduleSlug,
      });
    } catch (error) {
      console.error("Module checkout failed:", error);
      alert("Failed to start module checkout. Please try again.");
      setCheckoutPending(null);
    }
  };

  const handleBilling = async () => {
    try {
      setBillingPending(true);
      await openBillingPortal();
    } catch (error) {
      console.error("Billing portal error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to open billing portal.",
      );
      setBillingPending(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutPending(true);
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutPending(false);
    }
  };

  if (!access.signedIn && !access.loading) {
    return (
      <div className="min-h-screen bg-white text-[#1d1d1f]">
        <Navbar />
        <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-10 sm:px-6">
          <section className="rounded-[2.4rem] bg-[#f6f2ff] px-6 py-12 text-center sm:px-10">
            <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
              Access
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Manage your access in one place.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[1.02rem] leading-7 tracking-[-0.02em] text-[#6e6e73]">
              Sign in to see your material access, your Question Hub membership,
              and the next best upgrade for your study flow.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                state={nextState}
                className="rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-85"
              >
                Sign in
              </Link>
              <Link
                to="/login?mode=signup"
                state={nextState}
                className="rounded-full border border-[#d2d2d7] bg-white px-6 py-3 text-sm font-semibold !text-[#1d1d1f] transition hover:bg-[#f5f5f7]"
              >
                Create account
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6">
        <section className="rounded-[2.6rem] bg-[#f6f2ff] px-6 py-12 sm:px-10 lg:px-14">
          <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
            Access
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Everything you can use right now.
          </h1>
          <p className="mt-4 max-w-3xl text-[1.02rem] leading-7 tracking-[-0.02em] text-[#6e6e73]">
            Keep your materials and Question Hub membership in sync, so you can
            move from reading to practice without losing momentum.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1d1d1f]">
              {access.loading ? "Checking access..." : getPlanLabel(access.plan)}
            </div>
            {!access.loading ? (
              <div className="rounded-full bg-white px-4 py-2 text-sm text-[#6e6e73]">
                {getPlanAdminHint(access.plan)}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-4 rounded-[2.6rem] bg-[#fbfbfd] px-6 py-10 sm:px-10 lg:px-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                Material Access
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Your module library.
              </h2>
            </div>
            <div className="text-sm text-[#6e6e73]">
              {access.loading
                ? "Checking your modules..."
                : `${unlockedItems.length} of ${moduleItems.length} modules unlocked`}
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {subjects.map((subject) => {
              const subjectItems = moduleItems.filter(
                (item) => item.subjectSlug === subject.slug,
              );

              return (
                <div
                  key={subject.slug}
                  className="rounded-[1.6rem] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold tracking-[0.14em] text-[#8b8b90]">
                        {subject.code}
                      </div>
                      <h3 className="mt-2 text-[1.15rem] font-semibold tracking-[-0.03em]">
                        {subject.name}
                      </h3>
                    </div>
                    <div className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[0.72rem] font-semibold tracking-[0.08em] text-[#424245]">
                      {subjectItems.filter((item) => item.hasAccess).length}/{subjectItems.length}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {subjectItems.map((item) => (
                      <div
                        key={`${item.subjectSlug}-${item.moduleSlug}`}
                        className="flex items-center justify-between gap-3 rounded-[1rem] bg-[#fbfbfd] px-4 py-3"
                      >
                        <div>
                          <div className="text-sm font-medium text-[#1d1d1f]">
                            {item.moduleTitle}
                          </div>
                          {!item.hasAccess ? (
                            <div className="mt-1 text-xs text-[#6e6e73]">
                              {item.modulePrice}
                            </div>
                          ) : null}
                        </div>
                        {item.hasAccess ? (
                          <div className="rounded-full bg-[#eaf7ee] px-3 py-1 text-[0.72rem] font-semibold tracking-[0.08em] text-[#1d7a3e]">
                            HAS ACCESS
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleModuleCheckout(
                                item.subjectSlug,
                                item.moduleSlug,
                              )
                            }
                            disabled={checkoutPending !== null}
                            className="rounded-full bg-[#1d1d1f] px-4 py-2 text-[0.72rem] font-semibold tracking-[0.08em] text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {checkoutPending !== null ? "OPENING..." : "GET ACCESS"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!access.materialsAccess ? (
              <button
                type="button"
                onClick={() => handleCheckout("full")}
                disabled={checkoutPending !== null}
                className="rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutPending === "full"
                  ? "Opening checkout..."
                  : "Get full materials access"}
              </button>
            ) : null}
            <Link
              to="/hubs191"
              className="rounded-full border border-[#d2d2d7] bg-white px-6 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7]"
            >
              Browse subjects
            </Link>
          </div>
        </section>

        <section className="mt-4 rounded-[2.6rem] bg-[#fbfbfd] px-6 py-10 sm:px-10 lg:px-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                Question Hub
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Your practice membership.
              </h2>
            </div>
            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                questionHubActive
                  ? "bg-[#eaf7ee] text-[#1d7a3e]"
                  : "bg-[#f5f5f7] text-[#6e6e73]"
              }`}
            >
              {access.loading
                ? "Checking..."
                : questionHubActive
                  ? "ACTIVE"
                  : "NOT ACTIVE"}
            </div>
          </div>

          <div className="mt-5 max-w-3xl text-[1.02rem] leading-7 tracking-[-0.02em] text-[#6e6e73]">
            {access.loading
              ? "We’re checking your Question Hub status."
              : questionHubActive
                ? questionHubEndText
                  ? `Question Hub Premium is active on this account until ${questionHubEndText}.`
                  : "Question Hub Premium is active on this account. You can keep practising with unlimited access."
                : "You don’t have Question Hub Premium on this account yet. Add it if you want unlimited practice and explanations."}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {questionHubActive ? (
              <>
                <Link
                  to="/questions"
                  className="rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-85"
                >
                  Go to Question Hub
                </Link>
                <button
                  type="button"
                  onClick={handleBilling}
                  disabled={billingPending}
                  className="rounded-full border border-[#d2d2d7] bg-white px-6 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {billingPending ? "Opening billing..." : "Manage Question Hub"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleCheckout("practice")}
                disabled={checkoutPending !== null}
                className="rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutPending === "practice"
                  ? "Opening checkout..."
                  : "Get Question Hub Premium"}
              </button>
            )}
          </div>
        </section>

        <section className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-full border border-[#d2d2d7] bg-white px-6 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7]"
          >
            Back home
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutPending}
            className="rounded-full border border-[#d2d2d7] bg-white px-6 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoutPending ? "Signing out..." : "Log out"}
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
