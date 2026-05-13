import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import MaterialsExplorerModal from "../components/MaterialsExplorerModal";
import Navbar from "../components/Navbar";
import { subjects } from "../data/subjects";

const heroPreviewImage = "/OTAGO.png";
const materialsPreviewImage = "/NOTE.png";
const practicePreviewImage = "/SCREENSHOT.png";
const subjectPreviewImages = {
  HUBS191: "/HUBS.png",
  CELS191: "/CELS.png",
} as const;

const subjectDescriptions = {
  HUBS191: "Human Body Systems",
  CELS191: "Cells and Molecular Biology",
} as const;

function ArrowLink({
  href,
  to,
  children,
}: {
  href?: string;
  to?: string;
  children: ReactNode;
}) {
  const className =
    "text-[1.02rem] font-medium tracking-[-0.01em] text-[#2997ff] transition hover:opacity-80";

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

export default function HomePage() {
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white text-[#1d1d1f]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
      }}
    >
      <Navbar showHome={false} />
      <MaterialsExplorerModal
        isOpen={materialsModalOpen}
        onClose={() => setMaterialsModalOpen(false)}
      />

      <main className="pb-12 pt-[0.55rem] sm:pt-[0.6rem]">
        <section className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.8rem] bg-[#f5f5f7]">
            <img
              src={heroPreviewImage}
              alt="Otago campus"
              className="h-[calc(100svh-4.9rem)] min-h-[32rem] w-full object-cover brightness-[0.98] saturate-[0.78] sm:h-[calc(100svh-5.2rem)] sm:min-h-[35.5rem] lg:h-[calc(100svh-5.45rem)] lg:min-h-[40rem]"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(14,14,17,0.08)_0%,rgba(14,14,17,0.16)_24%,rgba(14,14,17,0.28)_58%,rgba(14,14,17,0.44)_100%)]" />

            <div className="absolute inset-x-0 bottom-0 px-6 pb-10 pt-24 text-center sm:px-10 sm:pb-12 lg:px-16 lg:pb-14">
              <div className="text-sm font-semibold tracking-[0.18em] text-white/70">
                HAERENGA NZ
              </div>
              <h1 className="mx-auto mt-4 max-w-5xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-[5.35rem]">
                Study in flow.
                <br />
                Practise with precision.
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 tracking-[-0.02em] text-white/78 sm:text-[1.4rem]">
                HSFY revision materials and question practice, tuned for the way you actually study.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                <button
                  type="button"
                  onClick={() => setMaterialsModalOpen(true)}
                  className="text-[1.02rem] font-medium tracking-[-0.01em] text-[#2997ff] transition hover:opacity-80"
                >
                  Material Hub <span aria-hidden="true">›</span>
                </button>
                <ArrowLink to="/questions">
                  Question Hub
                </ArrowLink>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-4 grid max-w-[1600px] gap-4 px-4 sm:px-6 lg:grid-cols-2">
          <article className="home-soft-card relative flex min-h-[min(29.35rem,calc(100svh-7.7rem))] flex-col overflow-hidden rounded-[2.8rem] bg-[#fbfbfd] px-6 pb-8 pt-10 text-center sm:px-10">
            <div className="pointer-events-none absolute inset-x-0 bottom-14 top-[10.5rem]">
              <div className="relative h-full w-full">
                <img
                  src={materialsPreviewImage}
                  alt=""
                  aria-hidden="true"
                  className="home-soft-card-image h-full w-full object-cover object-center opacity-44"
                />
                <div className="home-soft-card-overlay absolute inset-0 bg-[linear-gradient(180deg,#fbfbfd_0%,rgba(251,251,253,0.4)_18%,rgba(251,251,253,0)_34%,rgba(251,251,253,0)_72%,rgba(251,251,253,0.48)_86%,#fbfbfd_100%)]" />
              </div>
            </div>
            <div className="relative z-10 min-h-[13.5rem]">
              <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                Materials
              </div>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                Notes for every module.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[1.08rem] leading-7 tracking-[-0.02em] text-[#6e6e73] sm:text-[1.15rem]">
                Explore HUBS191 and CELS191.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                <button
                  type="button"
                  onClick={() => setMaterialsModalOpen(true)}
                  className="text-[1.02rem] font-medium tracking-[-0.01em] text-[#2997ff] transition hover:opacity-80"
                >
                  Open materials hub <span aria-hidden="true">›</span>
                </button>
              </div>
            </div>

            <div className="relative z-10 mt-auto flex min-h-[2rem] items-end justify-center">
              <div className="mx-auto max-w-full truncate whitespace-nowrap text-xs font-medium tracking-[0.02em] text-[#424245] sm:w-fit">
                Structured notes, model answers, and revision tools
              </div>
            </div>
          </article>

          <article className="home-practice-card relative flex min-h-[min(29.35rem,calc(100svh-7.7rem))] flex-col overflow-hidden rounded-[2.8rem] border border-black/10 bg-[#fbfbfd] px-6 pb-8 pt-10 text-center text-[#1d1d1f] sm:px-10">
            <div className="pointer-events-none absolute inset-x-0 bottom-14 top-[10.5rem]">
              <div className="relative h-full w-full">
                <img
                  src={practicePreviewImage}
                  alt=""
                  aria-hidden="true"
                  className="home-practice-preview-image h-full w-full object-cover object-[center_18%] opacity-70"
                />
                <div className="home-practice-preview-overlay absolute inset-0 bg-[linear-gradient(180deg,#fbfbfd_0%,rgba(251,251,253,0.54)_18%,rgba(251,251,253,0.08)_34%,rgba(251,251,253,0.08)_72%,rgba(251,251,253,0.62)_86%,#fbfbfd_100%)]" />
              </div>
            </div>
            <div className="relative z-10 min-h-[13.5rem]">
              <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                Practice
              </div>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                A better question hub.
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-[1.02rem] leading-7 tracking-[-0.02em] text-[#6e6e73] sm:text-[1.08rem]">
                Start free with HUBS191 and CELS191 question banks, filters, and explanations.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                <ArrowLink to="/questions">
                  Start practising
                </ArrowLink>
              </div>
            </div>

            <div className="relative z-10 mt-auto flex min-h-[2rem] items-end justify-center">
              <div className="mx-auto max-w-full truncate whitespace-nowrap text-xs font-medium tracking-[0.02em] text-[#424245] sm:w-fit">
                Subject filters, question flow, and free entry
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto mt-4 grid max-w-[1600px] gap-4 px-4 sm:px-6 lg:grid-cols-2">
          {subjects.map((subject) => (
            <article
              key={subject.slug}
              className={`home-soft-card relative overflow-hidden rounded-[2.8rem] px-6 pb-8 pt-12 sm:px-10 ${
                subject.code === "CELS191" ? "bg-[#f5f1ff]" : "bg-[#f7f8fb]"
              }`}
            >
              <img
                src={
                  subjectPreviewImages[
                    subject.code as keyof typeof subjectPreviewImages
                  ]
                }
                alt=""
                aria-hidden="true"
                className={`home-soft-card-image pointer-events-none absolute inset-0 h-full w-full object-cover ${
                  subject.code === "CELS191" ? "opacity-88" : "opacity-54"
                }`}
              />
              <div
                className={`home-soft-card-overlay pointer-events-none absolute inset-0 ${
                  subject.code === "CELS191"
                    ? "bg-[linear-gradient(180deg,rgba(245,241,255,0.84)_0%,rgba(245,241,255,0.74)_34%,rgba(245,241,255,0.88)_100%)]"
                    : "bg-[linear-gradient(180deg,rgba(247,248,251,0.82)_0%,rgba(247,248,251,0.54)_34%,rgba(247,248,251,0.84)_100%)]"
                }`}
              />

              <div className="relative z-10 text-center">
                <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                  {subject.code}
                </div>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                  {
                    subjectDescriptions[
                      subject.code as keyof typeof subjectDescriptions
                    ]
                  }
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-[1.02rem] leading-7 tracking-[-0.02em] text-[#6e6e73] sm:text-[1.08rem]">
                  {subject.code === "HUBS191"
                    ? "Revision support organised by body system and module."
                    : "Revision support organised by cells, genetics, and molecular biology."}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                  <ArrowLink to={`/${subject.slug}`}>
                    Browse {subject.code}
                  </ArrowLink>
                  <ArrowLink to={`/questions?subject=${subject.code}`}>
                    Practise questions
                  </ArrowLink>
                </div>
              </div>

              <div
                className={`relative z-10 mx-auto mt-10 grid max-w-2xl gap-2 ${
                  subject.code === "CELS191"
                    ? "grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-3"
                }`}
              >
                {subject.modules.slice(0, 6).map((module) => (
                  <Link
                    key={module.slug}
                    to={`/${subject.slug}/${module.slug}`}
                    className="flex min-h-[2.7rem] items-center justify-center rounded-full bg-white/78 px-3 py-1.5 text-center text-xs font-medium leading-4 text-[#424245] backdrop-blur-md transition hover:bg-white"
                  >
                    {module.title}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
