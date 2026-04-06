import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getModuleBySlugs } from "../data/subjects";

export default function ModulePage() {
  const { subjectSlug, moduleSlug } = useParams();

  const data =
    subjectSlug && moduleSlug
      ? getModuleBySlugs(subjectSlug, moduleSlug)
      : null;

  if (!data) {
    return <div className="p-10">Module not found.</div>;
  }

  const { subject, module } = data;

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#ffffff,rgba(248,250,252,0.96)_35%,#ffffff_100%)] text-slate-900">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-10 lg:pb-28 lg:pt-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-600 shadow-sm">
              {subject.code}
            </div>

            <h1 className="mt-8 text-5xl font-semibold leading-[0.95] tracking-tight text-slate-950 md:text-7xl">
              {module.title}
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              {module.description}
            </p>
          </div>
        </section>

        {/* FEATURES */}
        {module.features.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-10 lg:pb-32">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.04)] backdrop-blur md:p-12">
              <h2 className="text-2xl font-semibold text-slate-900">
                What you will get
              </h2>

              <div className="mt-10 grid gap-5 md:grid-cols-4">
                {module.features.map((feature) => (
                  <div
                    key={feature.number}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-400">
                        {feature.number}
                      </div>

                      {feature.badge && (
                        <div className="rounded-full border px-3 py-1 text-sm">
                          {feature.badge}
                        </div>
                      )}
                    </div>

                    <h3 className="mt-6 text-xl font-semibold text-slate-950">
                      {feature.title}
                    </h3>

                    {feature.bullets && (
                      <div className="mt-4 space-y-3">
                        {feature.bullets.map((b, i) => (
                          <div key={i} className="flex gap-2">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-900" />
                            <p className="text-sm text-slate-700">{b}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {feature.description && (
                      <p className="mt-4 text-sm text-slate-700">
                        {feature.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PRICE */}
            <div className="mt-16 text-center">
              <div className="text-5xl font-semibold text-slate-900">
                {module.price}
              </div>

              <p className="mt-3 text-sm text-slate-500">One-time access</p>

              <a
                href={module.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-full bg-slate-900 px-8 py-3.5 text-sm font-medium text-white shadow-lg"
              >
                Get access
              </a>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}