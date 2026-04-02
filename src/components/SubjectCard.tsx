import { Link } from "react-router-dom";
import type { SubjectItem } from "../data/subjects";

type SubjectCardProps = {
  subject: SubjectItem;
};

export default function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <Link
      to={`/${subject.slug}`}
      className="group block rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            {subject.code}
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {subject.name}
          </h3>
        </div>

        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {subject.modules.length} modules
        </div>
      </div>

      <p className="mt-5 text-base leading-8 text-slate-600">
        {subject.description}
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {subject.modules.slice(0, 3).map((module) => (
          <span
            key={module.slug}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            {module.title}
          </span>
        ))}
      </div>

      <div className="mt-8 text-sm font-medium text-slate-900">
        Browse {subject.code} →
      </div>
    </Link>
  );
}