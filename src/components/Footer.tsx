export default function Footer() {
  return (
    <footer className="border-t border-black/6 bg-[#fbfbfd]">
      <div className="mx-auto max-w-[1600px] px-6 py-6 sm:px-6 lg:px-6">
        <div className="flex flex-col items-center justify-between gap-2 text-center md:flex-row md:text-left">
          <div>
            <div className="text-sm font-semibold text-[#1d1d1f]">HaerengaNZ</div>
            <div className="text-xs text-[#6e6e73]">HSFY revision platform</div>
          </div>

          <div className="text-xs text-[#6e6e73]">
            © {new Date().getFullYear()} HaerengaNZ. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
