import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { subjects } from "../data/subjects";

type MaterialsExplorerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const subjectMeta = {
  HUBS191: {
    label: "Human Body Systems",
    image: "/HUBS.png",
    tint: "bg-[#f7f8fb]",
  },
  CELS191: {
    label: "Cells and Molecular Biology",
    image: "/CELS.png",
    tint: "bg-[#f5f1ff]",
  },
} as const;

export default function MaterialsExplorerModal({
  isOpen,
  onClose,
}: MaterialsExplorerModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-[0.2cm]">
      <div
        className="absolute inset-0 bg-black/28 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="materials-modal relative mx-auto h-[calc(100svh-0.4cm)] max-h-[46rem] w-full max-w-5xl overflow-hidden rounded-[2.4rem] border border-white/70 bg-white/92 text-[#1d1d1f] shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 text-xl text-[#6e6e73] transition hover:text-[#1d1d1f]"
          type="button"
        >
          ✕
        </button>

        <div className="relative flex h-full flex-col overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b8b90]">
            Materials
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Explore by subject.
          </h2>
          <p className="mt-3 max-w-2xl text-[1rem] leading-7 text-[#6e6e73]">
            Start with the subject you want to browse. Each subject page now acts
            as the materials hub entry point, then each module page becomes the
            module library you can study from.
          </p>

          <div className="mt-6 grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
            {subjects.map((subject) => {
              const meta = subjectMeta[subject.code as keyof typeof subjectMeta];

              return (
                <div
                  key={subject.slug}
                  className={`materials-subject-card relative flex h-full min-h-0 overflow-hidden rounded-[2rem] ${meta.tint} p-5 sm:p-6`}
                >
                  <img
                    src={meta.image}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35"
                  />
                  <div className="materials-subject-overlay pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.78)_40%,rgba(255,255,255,0.92)_100%)]" />

                  <div className="relative z-10 flex h-full w-full flex-col">
                    <div>
                      <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                        {subject.code}
                      </div>
                      <h3
                        className={`mt-2 font-semibold tracking-[-0.04em] ${
                          subject.code === "CELS191"
                            ? "text-[2rem] sm:text-[2.15rem]"
                            : "text-[2rem] sm:text-[2.25rem]"
                        }`}
                      >
                        {meta.label}
                      </h3>
                    </div>

                    <div className="mt-4">
                      <div className="inline-flex rounded-full bg-white/86 px-4 py-2 text-sm font-medium text-[#424245] shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                        {subject.modules.length} modules
                      </div>
                    </div>

                    <p className="mt-4 max-w-xl text-[1rem] leading-7 text-[#6e6e73]">
                      {subject.description}
                    </p>

                    <div
                      className={`mt-6 grid gap-2 ${
                        subject.code === "CELS191"
                          ? "grid-cols-2"
                          : "grid-cols-2 sm:grid-cols-3"
                      }`}
                    >
                      {subject.modules.slice(0, 6).map((module) => (
                        <Link
                          key={module.slug}
                          to={`/${subject.slug}/${module.slug}`}
                          onClick={onClose}
                          className="flex min-h-[2.8rem] items-center justify-center rounded-full bg-white/82 px-3 py-1.5 text-center text-xs font-medium leading-4 text-[#424245] shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:bg-white"
                        >
                          {module.title}
                        </Link>
                      ))}
                    </div>

                    <div className="mt-auto pt-8">
                      <Link
                        to={`/${subject.slug}`}
                        onClick={onClose}
                        className="text-[1.02rem] font-medium tracking-[-0.01em] text-[#1d1d1f] transition hover:opacity-80"
                      >
                        Open {subject.code} hub <span aria-hidden="true">›</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
