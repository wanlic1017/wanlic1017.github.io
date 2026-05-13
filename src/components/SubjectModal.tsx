import { motion } from "framer-motion";

type SubjectType = "HUBS191" | "CELS191";

interface Props {
  onSelect: (subject: SubjectType) => void;
  darkMode?: boolean;
}

export default function SubjectModal({ onSelect, darkMode = false }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      {/* Overlay */}
      <div
        className={`absolute inset-0 ${
          darkMode ? "bg-black/55" : "bg-slate-900/20"
        } backdrop-blur-md`}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`
          relative w-full max-w-2xl overflow-hidden rounded-[2rem] border shadow-2xl
          ${
            darkMode
              ? "border-slate-800 bg-slate-950/92 text-slate-100"
              : "border-white/70 bg-white/88 text-slate-900"
          }
          backdrop-blur-2xl
        `}
      >
        {/* Subtle top glow */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-32 ${
            darkMode
              ? "bg-gradient-to-b from-slate-800/40 to-transparent"
              : "bg-gradient-to-b from-slate-100/80 to-transparent"
          }`}
        />

        <div className="relative px-8 py-8 sm:px-10 sm:py-10">
          {/* Eyebrow */}
          <div
            className={`mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Question Hub
          </div>

          {/* Heading */}
          <h2
            className={`text-3xl font-semibold tracking-tight sm:text-4xl ${
              darkMode ? "text-white" : "text-slate-950"
            }`}
          >
            Choose your subject
          </h2>

          {/* Supporting text */}
          <p
            className={`mt-3 max-w-xl text-sm leading-6 sm:text-base ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Start with the subject you want to practise now. You can switch
            between HUBS191 and CELS191 later from the navigation bar.
          </p>

          {/* Options */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {/* HUBS */}
            <motion.button
              type="button"
              onClick={() => onSelect("HUBS191")}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200
                ${
                  darkMode
                    ? "border-blue-950/80 bg-blue-950/60 hover:border-blue-800 hover:bg-blue-900/50"
                    : "border-blue-100 bg-blue-50/85 hover:border-blue-200 hover:bg-blue-50"
                }
                shadow-[0_10px_30px_rgba(0,0,0,0.06)]
              `}
            >
              <div className="flex flex-col h-full">
                {/* 🔹 TOP ROW */}
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className={`
          inline-flex h-11 w-11 items-center justify-center rounded-2xl text-xl
          ${
            darkMode
              ? "bg-blue-900/80 text-blue-200"
              : "bg-white text-blue-600 shadow-sm"
          }
        `}
                    >
                      🫀
                    </div>

                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-xl font-semibold tracking-tight ${
                          darkMode ? "text-blue-100" : "text-slate-900"
                        }`}
                      >
                        HUBS191
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          darkMode
                            ? "bg-blue-900/70 text-blue-200"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        Anatomy & Physiology
                      </span>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div
                    className={`text-sm font-medium transition pr-1 ${
                      darkMode
                        ? "text-blue-300/80 group-hover:text-blue-200"
                        : "text-blue-600/80 group-hover:text-blue-700"
                    }`}
                  >
                    Enter →
                  </div>
                </div>

                {/* 🔹 DESCRIPTION (FULL WIDTH NOW) */}
                <p
                  className={`mt-4 text-sm leading-6 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Human body systems, physiology, structure, function, and
                  integrated mechanisms.
                </p>
              </div>

              <div
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-px ${
                  darkMode
                    ? "bg-gradient-to-r from-transparent via-blue-700/50 to-transparent"
                    : "bg-gradient-to-r from-transparent via-blue-200 to-transparent"
                }`}
              />
            </motion.button>

            {/* CELS */}
            {/* CELS */}
            <motion.button
              type="button"
              onClick={() => onSelect("CELS191")}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
    group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200
    ${
      darkMode
        ? "border-green-950/80 bg-green-950/50 hover:border-green-800 hover:bg-green-900/45"
        : "border-green-100 bg-green-50/85 hover:border-green-200 hover:bg-green-50"
    }
    shadow-[0_10px_30px_rgba(0,0,0,0.06)]
  `}
            >
              <div className="flex flex-col h-full">
                {/* 🔹 TOP ROW */}
                <div className="flex items-start justify-between">
                  <div>
                    {/* ICON */}
                    <div
                      className={`
            inline-flex h-11 w-11 items-center justify-center rounded-2xl text-xl
            ${
              darkMode
                ? "bg-green-900/80 text-green-200"
                : "bg-white text-green-600 shadow-sm"
            }
          `}
                    >
                      🧬
                    </div>

                    {/* TITLE + TAG */}
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-xl font-semibold tracking-tight ${
                          darkMode ? "text-green-100" : "text-slate-900"
                        }`}
                      >
                        CELS191
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          darkMode
                            ? "bg-green-900/70 text-green-200"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        Cells & Microbiology
                      </span>
                    </div>
                  </div>

                  {/* 🔹 ENTER */}
                  <div
                    className={`text-sm font-medium transition pr-1 ${
                      darkMode
                        ? "text-green-300/80 group-hover:text-green-200"
                        : "text-green-600/80 group-hover:text-green-700"
                    }`}
                  >
                    Enter →
                  </div>
                </div>

                {/* 🔹 DESCRIPTION (FULL WIDTH) */}
                <p
                  className={`mt-4 text-sm leading-6 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Cells, molecular biology, membranes, genetics, metabolism, and
                  core biological processes.
                </p>
              </div>

              {/* 🔹 BOTTOM LINE */}
              <div
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-px ${
                  darkMode
                    ? "bg-gradient-to-r from-transparent via-green-700/50 to-transparent"
                    : "bg-gradient-to-r from-transparent via-green-200 to-transparent"
                }`}
              />
            </motion.button>
          </div>

          {/* Bottom note */}
          <div
            className={`mt-6 text-xs ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Your choice here sets the starting question pool only.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
