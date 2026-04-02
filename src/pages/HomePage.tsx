import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SubjectCard from "../components/SubjectCard";
import { subjects } from "../data/subjects";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-900">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src="/otago-campus.jpg"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        <Navbar />

        <main>
          {/* HERO */}
          <section className="mx-auto max-w-7xl px-6 pb-28 pt-28 lg:px-10 lg:pb-36 lg:pt-36">
            <div className="max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-600 shadow-sm backdrop-blur">
                Otago Health Science · HSFY
              </div>

              <h1 className="mt-8 text-5xl font-semibold leading-[0.95] tracking-tight text-slate-950 md:text-7xl">
                Study smarter.
                <br />
                Score higher.
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                Premium revision resources designed specifically for Otago Health Science students.
                Built to help you turn understanding into clear, structured answers that score marks.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-4">
                <a
                  href="#subjects"
                  className="rounded-full bg-slate-900 px-7 py-3.5 text-sm font-medium text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Browse subjects
                </a>

                <a
                  href="#why"
                  className="rounded-full border border-slate-300 bg-white/80 px-7 py-3.5 text-sm font-medium text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm"
                >
                  Why this works
                </a>
              </div>
            </div>
          </section>

          {/* SUBJECTS */}
          <section
            id="subjects"
            className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36"
          >
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Browse by subject
              </p>

              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Start with the paper you need.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Each subject is structured by module so you can go directly to what matters most,
                without wasting time searching through notes.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {subjects.map((subject) => (
                <SubjectCard key={subject.slug} subject={subject} />
              ))}
            </div>
          </section>

          {/* WHY */}
          <section
            id="why"
            className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36"
          >
            <div className="rounded-[2.2rem] bg-slate-900 px-8 py-14 text-white shadow-xl md:px-12 md:py-16">
              <div className="max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                  Built for Otago students
                </p>

                <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
                  Designed for how HSFY exams actually work.
                </h2>

                <p className="mt-6 text-lg leading-8 text-slate-300">
                  Based on years of tutoring Otago Health Science students,
                  these resources focus on what actually earns marks — not just content,
                  but clarity, structure, and exam-ready explanation.
                </p>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {[
                  "Aligned with HUBS191 and CELS191 assessments",
                  "Focus on structure and wording, not just memorisation",
                  "Built from real tutoring experience with HSFY students",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.7rem] border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/10"
                  >
                    <p className="text-base leading-8 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}