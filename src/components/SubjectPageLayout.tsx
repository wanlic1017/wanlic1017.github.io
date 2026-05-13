import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "./Footer";
import ModuleCard from "./ModuleCard";
import Navbar from "./Navbar";
import { useAccessState } from "../hooks/useAccessState";
import { getPlanLabel } from "../config/access";
import { type SubjectItem } from "../data/subjects";
import { startCheckout } from "../services/checkoutService";

const subjectTheme = {
  HUBS191: {
    heroImage: "/HUBS.png",
    heroSurface: "bg-[#f5f5f7]",
    heroOverlay:
      "bg-[linear-gradient(180deg,rgba(14,14,17,0.1)_0%,rgba(14,14,17,0.18)_24%,rgba(14,14,17,0.32)_62%,rgba(14,14,17,0.5)_100%)]",
    sectionSurface: "bg-[#fbfbfd]",
    featureSurface: "bg-[#f7f8fb]",
    featureChipSurface: "bg-white text-[#424245]",
  },
  CELS191: {
    heroImage: "/CELS.png",
    heroSurface: "bg-[#f5f1ff]",
    heroOverlay:
      "bg-[linear-gradient(180deg,rgba(29,24,54,0.08)_0%,rgba(29,24,54,0.16)_24%,rgba(29,24,54,0.3)_62%,rgba(29,24,54,0.46)_100%)]",
    sectionSurface: "bg-[#fbfbfd]",
    featureSurface: "bg-[#f6f2ff]",
    featureChipSurface: "bg-white text-[#424245]",
  },
} as const;

function ArrowLink({
  href,
  to,
  onClick,
  children,
  dark = false,
}: {
  href?: string;
  to?: string;
  onClick?: () => void;
  children: ReactNode;
  dark?: boolean;
}) {
  const className = `text-[1.02rem] font-medium tracking-[-0.01em] transition hover:opacity-80 ${
    dark
      ? "text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]"
      : "text-[#1d1d1f]"
  }`;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children} <span aria-hidden="true">›</span>
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children} <span aria-hidden="true">›</span>
      </button>
    );
  }

  return (
    <Link to={to ?? "/"} className={className}>
      {children} <span aria-hidden="true">›</span>
    </Link>
  );
}

type SubjectPageLayoutProps = {
  subject: SubjectItem;
};

export default function SubjectPageLayout({
  subject,
}: SubjectPageLayoutProps) {
  const access = useAccessState();
  const [fullCheckoutPending, setFullCheckoutPending] = useState(false);
  const theme =
    subjectTheme[subject.code as keyof typeof subjectTheme] ?? subjectTheme.HUBS191;
  const moduleCountLabel = `${subject.modules.length} modules`;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [subject.slug]);

  const scrollToModules = () => {
    const element = document.getElementById("subject-modules");
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, left: 0, behavior: "smooth" });
  };

  const handleFullCheckout = async () => {
    try {
      setFullCheckoutPending(true);
      await startCheckout({ purchaseType: "full" });
    } catch (error) {
      console.error("Full access checkout failed:", error);
      alert("Failed to start checkout. Please try again.");
      setFullCheckoutPending(false);
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white text-[#1d1d1f]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
      }}
    >
      <Navbar />

      <main className="pb-12 pt-[0.55rem] sm:pt-[0.6rem]">
        <section className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div
            className={`relative overflow-hidden rounded-[2.8rem] ${theme.heroSurface}`}
          >
            <img
              src={theme.heroImage}
              alt={subject.name}
              className="h-[calc(100svh-4.9rem)] min-h-[31.5rem] w-full object-cover object-center sm:h-[calc(100svh-5.2rem)] sm:min-h-[35rem] lg:h-[calc(100svh-5.45rem)] lg:min-h-[39rem]"
            />
            <div className={`pointer-events-none absolute inset-0 ${theme.heroOverlay}`} />

            <div className="absolute inset-x-0 bottom-0 px-6 pb-10 pt-24 text-center sm:px-10 sm:pb-12 lg:px-16 lg:pb-14">
              <div className="text-sm font-semibold tracking-[0.18em] text-white/72">
                {subject.code}
              </div>
              <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-[5.15rem]">
                {subject.name}
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 tracking-[-0.02em] text-white/80 sm:text-[1.35rem]">
                {subject.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                <ArrowLink onClick={scrollToModules} dark>
                  View content
                </ArrowLink>
                <ArrowLink to={`/questions?subject=${subject.code}`} dark>
                  Practise {subject.code}
                </ArrowLink>
              </div>
            </div>

            <div className="absolute right-6 top-6 hidden rounded-full bg-white/16 px-4 py-2 text-sm font-medium tracking-[0.02em] text-white backdrop-blur-md sm:block">
              {moduleCountLabel}
            </div>
          </div>
        </section>

        <section
          id="subject-modules"
          className="mx-auto mt-4 max-w-[1600px] scroll-mt-24 px-4 sm:px-6"
        >
          <article
            className={`overflow-hidden rounded-[2.8rem] ${theme.sectionSurface} px-6 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-6 xl:min-h-[calc(100svh-7rem)]`}
          >
            <div className="flex h-full flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                    Modules
                  </div>
                  <h2 className="mt-1 text-[2rem] font-semibold tracking-[-0.05em] sm:text-[2.7rem]">
                    Start from one module, or get full access.
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#424245] shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    {moduleCountLabel}
                  </div>
                  <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#424245] shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    {access.loading ? "Checking access..." : getPlanLabel(access.plan)}
                  </div>
                  <ArrowLink to={`/questions?subject=${subject.code}`}>
                    Practise {subject.code}
                  </ArrowLink>
                </div>
              </div>

              <div
                className={`grid flex-1 content-start gap-2.5 sm:grid-cols-2 ${
                  subject.code === "CELS191" ? "lg:grid-cols-2" : "xl:grid-cols-3"
                }`}
              >
                {subject.modules.map((module) => (
                  <ModuleCard
                    key={module.slug}
                    subjectSlug={subject.slug}
                    subjectCode={subject.code}
                    module={module}
                    hasAccess={access.canAccessModule(subject.slug, module.slug)}
                    accessLoading={access.loading}
                    signedIn={access.signedIn}
                  />
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto mt-4 max-w-[1600px] px-4 sm:px-6">
          <div
            className={`overflow-hidden rounded-[2.8rem] ${theme.featureSurface} px-6 py-12 text-center sm:px-10 lg:px-14`}
          >
            <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
              Full Material Access
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              $88
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-[1.02rem] leading-7 tracking-[-0.02em] text-[#6e6e73] sm:text-[1.08rem]">
              Access all of HSFY HUBS191 and CELS191 topics including Tissues
              and Movement, Musculoskeletal, Bio-statistics, Nervous System,
              Endocrine System, Immune System, Cell Structure & Diversity,
              Molecular Biology & Genetics, Human Molecular Genetics, and
              Microbiology.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {access.signedIn ? (
                <ArrowLink onClick={handleFullCheckout}>
                  {fullCheckoutPending
                    ? "Opening checkout"
                    : "Get full material access"}
                </ArrowLink>
              ) : (
                <ArrowLink to="/login">
                  Sign in to get full material access
                </ArrowLink>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
