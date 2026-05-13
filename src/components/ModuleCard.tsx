import { useState } from "react";
import { Link } from "react-router-dom";
import type { ModuleItem } from "../data/subjects";
import { startCheckout } from "../services/checkoutService";

type ModuleCardProps = {
  subjectSlug: string;
  subjectCode?: string;
  module: ModuleItem;
  hasAccess?: boolean;
  accessLoading?: boolean;
  signedIn?: boolean;
};

const subjectCardTheme = {
  HUBS191: {
    surface: "bg-white",
    mutedSurface: "bg-[#f5f5f7]",
    border: "ring-black/5",
    textMuted: "text-[#6e6e73]",
    actionSurface: "bg-[#1d1d1f] text-white hover:bg-black",
  },
  CELS191: {
    surface: "bg-white",
    mutedSurface: "bg-[#f6f2ff]",
    border: "ring-black/5",
    textMuted: "text-[#6e6e73]",
    actionSurface: "bg-[#1d1d1f] text-white hover:bg-black",
  },
} as const;

const moduleDescriptionFallbacks: Record<string, string> = {
  "cels191/Cell Structure & Diversity":
    "Cell architecture, membranes, organelles, and the diversity of prokaryotic and eukaryotic life.",
  "cels191/Molecular Biology & Genetics":
    "DNA, gene expression, inheritance, and the molecular tools used to study genetic information.",
  "cels191/Human Molecular Genetics":
    "Human genetic variation, mutation, inheritance patterns, and the molecular basis of disease.",
  "cels191/Microbiology":
    "Microbial structure, growth, genetics, and how bacteria and viruses shape health and disease.",
};

export default function ModuleCard({
  subjectSlug,
  subjectCode = "HUBS191",
  module,
  hasAccess = false,
  accessLoading = false,
  signedIn = false,
}: ModuleCardProps) {
  const [checkoutPending, setCheckoutPending] = useState(false);
  const theme =
    subjectCardTheme[subjectCode as keyof typeof subjectCardTheme] ??
    subjectCardTheme.HUBS191;
  const moduleDescription =
    moduleDescriptionFallbacks[`${subjectSlug}/${module.slug}`] ??
    module.description;

  const handleModuleCheckout = async () => {
    try {
      setCheckoutPending(true);
      await startCheckout({
        purchaseType: "module",
        subjectSlug,
        moduleSlug: module.slug,
      });
    } catch (error) {
      console.error("Module checkout failed:", error);
      alert("Failed to start checkout. Please try again.");
      setCheckoutPending(false);
    }
  };

  return (
    <div
      className={`group flex h-full flex-col rounded-[2rem] border border-black/10 ${theme.surface} p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ${theme.border} transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(15,23,42,0.1)] sm:p-5`}
    >
      <div className="flex flex-1 flex-col">
        <Link to={`/${subjectSlug}/${module.slug}`} className="block">
          <div
            className={`inline-flex rounded-full ${theme.mutedSurface} px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-[#424245]`}
          >
            {module.price}
          </div>

          <h3 className="mt-2.5 text-[1.14rem] font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-[1.22rem]">
            {module.title}
          </h3>

          <p className={`mt-1.5 text-sm leading-5.5 ${theme.textMuted}`}>
            {moduleDescription}
          </p>
        </Link>

        <div className="mt-3 flex flex-wrap gap-2">
          {module.features.map((feature) => (
            <div
              key={feature.number}
              className={`rounded-full ${theme.mutedSurface} px-3 py-1.5 text-xs font-medium text-[#424245]`}
            >
              {feature.title}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <Link
          to={`/${subjectSlug}/${module.slug}`}
          className="inline-flex min-h-[2.75rem] items-center text-sm font-medium text-[#1d1d1f] transition hover:opacity-80"
        >
          View module <span aria-hidden="true">›</span>
        </Link>

        {accessLoading ? (
          <div
            className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 py-2 text-xs font-medium ${theme.mutedSurface}`}
          >
            Checking...
          </div>
        ) : hasAccess ? (
          <Link
            to={`/${subjectSlug}/${module.slug}`}
            className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 py-2 text-xs font-medium transition ${theme.actionSurface}`}
          >
            Go to notes
          </Link>
        ) : !signedIn ? (
          <Link
            to="/login"
            state={{ next: `/${subjectSlug}/${module.slug}` }}
            className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 py-2 text-xs font-medium transition ${theme.actionSurface}`}
          >
            Get access
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleModuleCheckout}
            disabled={checkoutPending}
            className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${theme.actionSurface}`}
          >
            {checkoutPending ? "Opening..." : "Get access"}
          </button>
        )}
      </div>
    </div>
  );
}
