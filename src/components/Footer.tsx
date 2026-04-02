export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Haerenga
            </div>
            <div className="text-xs text-slate-500">
              HSFY revision platform
            </div>
          </div>

          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} Haerenga. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}