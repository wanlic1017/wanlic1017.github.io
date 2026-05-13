import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AccessGate from "../components/AccessGate";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getPlanLabel } from "../config/access";
import { useAccessState } from "../hooks/useAccessState";
import { getModuleBySlugs } from "../data/subjects";
import { startCheckout } from "../services/checkoutService";

const subjectTheme = {
  HUBS191: {
    shell: "bg-white text-[#1d1d1f]",
    heroSurface: "bg-[#f5f5f7]",
    heroOverlay:
      "bg-[linear-gradient(180deg,rgba(14,14,17,0.12)_0%,rgba(14,14,17,0.2)_26%,rgba(14,14,17,0.34)_64%,rgba(14,14,17,0.5)_100%)]",
    sectionSurface: "bg-[#fbfbfd]",
    chipSurface: "bg-white text-[#424245]",
    featureSurface: "bg-[#f7f8fb]",
  },
  CELS191: {
    shell: "bg-white text-[#1d1d1f]",
    heroSurface: "bg-[#f5f1ff]",
    heroOverlay:
      "bg-[linear-gradient(180deg,rgba(29,24,54,0.08)_0%,rgba(29,24,54,0.16)_26%,rgba(29,24,54,0.28)_64%,rgba(29,24,54,0.44)_100%)]",
    sectionSurface: "bg-[#fbfbfd]",
    chipSurface: "bg-white text-[#424245]",
    featureSurface: "bg-[#f6f2ff]",
  },
} as const;

const moduleHeroImages: Record<string, Record<string, string>> = {
  HUBS191: {
    "tissues-and-movement": "/HUBS Modules/Module 1 Tissue.png",
    musculoskeletal: "/HUBS Modules/Module 2 Musculoskeletal.png",
    "bio-statistics": "/HUBS Modules/Module 3 Biostatistics.png",
    "nervous-system": "/HUBS Modules/Module 4 Nervous.png",
    "endocrine-system": "/HUBS Modules/Module 5 Endocrine.png",
    "immune-system": "/HUBS Modules/Module 6 Immune.png",
  },
  CELS191: {
    "Cell Structure & Diversity": "/CECLS Modules/Module 1 Diversity.png",
    "Molecular Biology & Genetics": "/CECLS Modules/Module 2 Molecular.png",
    "Human Molecular Genetics": "/CECLS Modules/Module 3 Genetics.png",
    Microbiology: "/CECLS Modules/Module 4 Microbiology.png",
  },
} as const;

function ArrowLink({
  href,
  to,
  children,
  dark = false,
}: {
  href?: string;
  to?: string;
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

  return (
    <Link to={to ?? "/"} className={className}>
      {children} <span aria-hidden="true">›</span>
    </Link>
  );
}

export default function ModulePage() {
  const access = useAccessState();
  const { subjectSlug, moduleSlug } = useParams();
  const [checkoutPending, setCheckoutPending] = useState(false);

  const data =
    subjectSlug && moduleSlug
      ? getModuleBySlugs(subjectSlug, moduleSlug)
      : null;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [subjectSlug, moduleSlug]);

  if (!data) {
    return <div className="p-10">Module not found.</div>;
  }

  const { subject, module } = data;
  const theme =
    subjectTheme[subject.code as keyof typeof subjectTheme] ?? subjectTheme.HUBS191;
  const heroImage =
    moduleHeroImages[subject.code]?.[module.slug] ??
    (subject.code === "CELS191" ? "/CELS.png" : "/HUBS.png");
  const moduleHasAccess = access.canAccessModule(subject.slug, module.slug);
  const featureGridColumns =
    module.features.length >= 4
      ? "xl:grid-cols-4"
      : module.features.length === 2
        ? "lg:grid-cols-2"
        : "xl:grid-cols-3";
  const libraryGridColumns =
    module.features.length >= 4
      ? "lg:grid-cols-[minmax(20rem,0.65fr)_minmax(58rem,1.65fr)]"
      : module.features.length === 2
        ? "lg:grid-cols-[minmax(18rem,0.78fr)_minmax(34rem,1.22fr)]"
        : "lg:grid-cols-[0.9fr_1.1fr]";

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const top =
      element.getBoundingClientRect().top + window.scrollY - 24;

    window.scrollTo({
      top,
      left: 0,
      behavior: "smooth",
    });
  };

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

  const isInternalAppPath = (href: string) =>
    href.startsWith("/") && !href.startsWith("/materials/");

  const mapMaterialHrefToLibrary = (href: string) => {
    if (!href.startsWith("/materials/")) return href;

    const stem = href.split("/").pop()?.replace(/\.pdf$/i, "") ?? "";
    const params = new URLSearchParams({
      module: module.slug,
      resource: stem,
    });
    return `/library/${subject.slug}?${params.toString()}`;
  };

  return (
    <div
      className={`min-h-screen overflow-x-hidden ${theme.shell}`}
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
              src={heroImage}
              alt={subject.name}
              className="h-[calc(100svh-4.9rem)] min-h-[32rem] w-full scale-[1.14] object-cover object-center sm:h-[calc(100svh-5.2rem)] sm:min-h-[35.5rem] sm:scale-[1.12] lg:h-[calc(100svh-5.45rem)] lg:min-h-[40rem] lg:scale-[1.1]"
            />
            <div className={`pointer-events-none absolute inset-0 ${theme.heroOverlay}`} />

            <div className="absolute inset-x-0 bottom-0 px-6 pb-10 pt-24 text-center sm:px-10 sm:pb-12 lg:px-16 lg:pb-14">
              <div className="text-sm font-semibold tracking-[0.18em] text-white/72">
                {subject.code} MODULE
              </div>
              <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-[5.15rem]">
                {module.title}
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 tracking-[-0.02em] text-white/80 sm:text-[1.35rem]">
                {module.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                <button
                  type="button"
                  onClick={() => scrollToSection("module-library")}
                  className="text-[1.02rem] font-medium tracking-[-0.01em] text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] transition hover:opacity-80"
                >
                  Open module library <span aria-hidden="true">›</span>
                </button>
                <ArrowLink to={`/questions?subject=${subject.code}`} dark>
                  Practise this subject
                </ArrowLink>
                <ArrowLink to={`/${subject.slug}#subject-modules`} dark>
                  Back to {subject.code}
                </ArrowLink>
              </div>
            </div>
          </div>
        </section>

        <section
          id="module-library"
          className="mx-auto mt-4 max-w-[1600px] scroll-mt-24 px-4 sm:px-6"
        >
          <article
            className={`overflow-hidden rounded-[2.8rem] ${theme.sectionSurface} px-6 py-12 sm:px-10 lg:px-14 lg:py-14`}
          >
            <div className={`grid gap-10 ${libraryGridColumns} lg:items-stretch`}>
              <div className="flex h-full flex-col">
                <div className="max-w-[34rem]">
                  <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                    Module Library
                  </div>
                  <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                    Study this module online.
                  </h2>
                </div>

                <div className="mt-5 lg:mt-auto">
                  <p className="max-w-lg text-[1.05rem] leading-7 tracking-[-0.02em] text-[#6e6e73]">
                    Notes, revision tools, and module resources in one place.
                    Current access:{" "}
                    {access.loading ? "checking..." : getPlanLabel(access.plan)}.
                  </p>
                </div>
              </div>
              <div className={`grid gap-4 sm:grid-cols-2 ${featureGridColumns}`}>
                {module.features.map((feature) => (
                  <div
                    key={feature.number}
                    className={`module-feature-card flex h-full flex-col rounded-[2rem] border border-black/10 ${theme.chipSurface} p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs font-semibold tracking-[0.14em] text-[#8b8b90]">
                          {feature.number}
                        </div>
                        {feature.badge ? (
                          <div className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[0.68rem] font-semibold tracking-[0.08em] text-[#424245]">
                            {feature.badge}
                          </div>
                        ) : null}
                      </div>
                      <h3 className="mt-4 text-[1.22rem] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                        {feature.title}
                      </h3>
                      {feature.description ? (
                        <p className="mt-2 text-sm leading-6 text-[#424245]">
                          {feature.description}
                        </p>
                      ) : null}
                      {feature.bullets ? (
                        <div className="mt-3 space-y-2">
                          {feature.bullets.map((bullet) => (
                            <div
                              key={bullet}
                              className="flex items-start gap-2 text-sm leading-6 text-[#424245]"
                            >
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1d1d1f]" />
                              <span>{bullet}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {access.loading ? (
                      <div className="mt-auto pt-4 text-sm font-medium text-[#8b8b90]">
                        Checking access...
                      </div>
                    ) : moduleHasAccess ? (
                      <div className="mt-auto flex flex-wrap gap-2 pt-4">
                        {(
                          feature.resourceLinks ?? [
                            {
                              label: `Open ${feature.title.toLowerCase()}`,
                              href: feature.resourceHref ?? "#study-flow",
                            },
                          ]
                        ).map((resource) => (
                          isInternalAppPath(mapMaterialHrefToLibrary(resource.href)) ? (
                            <Link
                              key={`${feature.number}-${resource.href}`}
                              to={mapMaterialHrefToLibrary(resource.href)}
                              className="inline-flex min-w-fit items-center gap-1 whitespace-nowrap rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-semibold text-[#1677d2] transition hover:bg-[#e1efff] hover:text-[#0057b8]"
                            >
                              {resource.label} <span aria-hidden="true">›</span>
                            </Link>
                          ) : (
                            <a
                              key={`${feature.number}-${resource.href}`}
                              href={mapMaterialHrefToLibrary(resource.href)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-w-fit items-center gap-1 whitespace-nowrap rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-semibold text-[#1677d2] transition hover:bg-[#e1efff] hover:text-[#0057b8]"
                            >
                              {resource.label} <span aria-hidden="true">›</span>
                            </a>
                          )
                        ))}
                      </div>
                    ) : access.signedIn ? (
                      <button
                        type="button"
                        onClick={handleModuleCheckout}
                        disabled={checkoutPending}
                        className="mt-auto inline-flex pt-4 text-sm font-medium text-[#2997ff] transition hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {checkoutPending
                          ? "Opening checkout..."
                          : "Unlock with module access"}{" "}
                        <span aria-hidden="true">›</span>
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        state={{ next: `/${subject.slug}/${module.slug}` }}
                        className="mt-auto inline-flex pt-4 text-sm font-medium text-[#2997ff] transition hover:opacity-75"
                      >
                        Sign in to unlock <span aria-hidden="true">›</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto mt-4 max-w-[1600px] px-4 sm:px-6">
          <AccessGate
            require="materials"
            subjectSlug={subject.slug}
            moduleSlug={module.slug}
          >
            <div
              id="study-flow"
              className={`overflow-hidden rounded-[2.8rem] ${theme.featureSurface} px-6 py-12 text-center sm:px-10 lg:px-14`}
            >
              <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                Study Flow
              </div>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                Stay in the loop.
              </h2>
              <p className="mx-auto mt-3 max-w-3xl text-[1.02rem] leading-7 tracking-[-0.02em] text-[#6e6e73] sm:text-[1.08rem]">
                Review this module online, then jump into question practice
                while the same material is still active in memory.
              </p>

              <div className="mt-8 grid w-full gap-y-3 text-center sm:gap-y-4 lg:grid-cols-3 lg:items-start lg:gap-x-6">
                <div className="flex justify-center lg:justify-end">
                  <ArrowLink to={`/${subject.slug}`}>Back to subject hub</ArrowLink>
                </div>
                <div className="flex justify-center">
                  <ArrowLink to={`/questions?subject=${subject.code}`}>
                    Go to practice
                  </ArrowLink>
                </div>
                <div className="flex justify-center lg:justify-start">
                  <ArrowLink to="/account">Manage access</ArrowLink>
                </div>
              </div>
            </div>
          </AccessGate>
        </section>
      </main>

      <Footer />
    </div>
  );
}
