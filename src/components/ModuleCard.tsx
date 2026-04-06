import { Link } from "react-router-dom";
import type { ModuleItem } from "../data/subjects";

type ModuleCardProps = {
  subjectSlug: string;
  module: ModuleItem;
};

export default function ModuleCard({
  subjectSlug,
  module,
}: ModuleCardProps) {
  return (
    <div className="group rounded-[1.8rem] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(15,23,42,0.1)]">
      <Link to={`/${subjectSlug}/${module.slug}`} className="block">
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
          {module.title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          {module.description}
        </p>
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">
          {module.price}
        </span>

        <div className="flex items-center gap-3">
          <Link
            to={`/${subjectSlug}/${module.slug}`}
            className="text-sm font-medium text-slate-700 transition hover:translate-x-1"
          >
            View →
          </Link>

          <a
            href={module.link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            Get access
          </a>
        </div>
      </div>
    </div>
  );
}