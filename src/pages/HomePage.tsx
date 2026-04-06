import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { subjects } from "../data/subjects";
import SubjectCard from "../components/SubjectCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#ffffff,rgba(248,250,252,0.96)_35%,#ffffff_100%)] text-slate-900">
      
      <Navbar />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-10 lg:pb-28">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Master HSFY with clarity and confidence
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Structured notes, exam-focused explanations, and interactive
            question practice for HUBS191 and CELS191.
          </p>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}