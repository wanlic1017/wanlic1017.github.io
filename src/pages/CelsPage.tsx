import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ModuleCard from "../components/ModuleCard";
import { getSubjectBySlug } from "../data/subjects";

export default function CelsPage() {
  const subject = getSubjectBySlug("cels191");

  if (!subject) {
    return <div className="p-10">Subject not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#ffffff,rgba(248,250,252,0.96)_35%,#ffffff_100%)] text-slate-900">
      <Navbar />

      <main>
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-10 lg:pb-28 lg:pt-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-600 shadow-sm">
              {subject.code}
            </div>

            <h1 className="mt-8 text-5xl font-semibold leading-[0.95] tracking-tight text-slate-950 md:text-7xl">
              {subject.name}
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              {subject.description}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-32">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Modules
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Browse CELS191 by module
              </h2>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              {subject.modules.length} modules
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {subject.modules.map((module) => (
              <ModuleCard
                key={module.slug}
                subjectSlug={subject.slug}
                module={module}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}