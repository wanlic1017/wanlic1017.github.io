import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="group">
          <div className="text-lg font-semibold tracking-tight text-slate-950 transition group-hover:opacity-80">
            Haerenga
          </div>
          <div className="text-xs tracking-wide text-slate-500">
            HSFY revision platform
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/hubs191"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            HUBS191
          </Link>
          <Link
            to="/cels191"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            CELS191
          </Link>
        </nav>

        <Link
          to="/hubs191"
          className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          Browse Resources
        </Link>
      </div>
    </header>
  );
}