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
    <Link
      to={`/${subjectSlug}/${module.slug}`}
      className="group block rounded-[1.8rem] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(15,23,42,0.1)]"
    >
      <h3 className="text-lg font-semibold tracking-tight text-slate-950">
        {module.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {module.description}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">
          {module.price}
        </span>

        <span className="text-sm font-medium text-slate-700 group-hover:translate-x-1 transition">
          View →
        </span>
      </div>
    </Link>
  );
}