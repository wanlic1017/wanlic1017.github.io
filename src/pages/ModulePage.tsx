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

        {/* CONTENT */}
        <section className="mx-auto max-w-5xl px-6 pb-24 lg:px-10 lg:pb-32">
          <div className="rounded-[2rem] bg-slate-50 p-8 md:p-12">
            <h2 className="text-2xl font-semibold text-slate-900">
              What you will get
            </h2>

            <ul className="mt-6 space-y-4 text-slate-700">
              <li>• High-yield summaries</li>
              <li>• Exam answer structures</li>
              <li>• Worked examples</li>
              <li>• Common mistakes</li>
            </ul>
          </div>

          {/* PRICING */}
          <div className="mt-16 text-center">
            <div className="text-5xl font-semibold text-slate-900">
              {module.price}
            </div>

            <p className="mt-3 text-sm text-slate-500">
              One-time access
            </p>

            <button className="mt-8 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
              Get access
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}