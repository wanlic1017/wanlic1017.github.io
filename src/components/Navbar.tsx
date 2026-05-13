import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Modal from "./Modal";
import AccountContent from "./AccountContent";
import { useTheme } from "../contexts/useTheme";

interface Props {
  actions?: ReactNode;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  darkMode?: boolean;
  showAccount?: boolean;
  showHome?: boolean;
  showThemeToggle?: boolean;
  homePlacement?: "left" | "right";
}

export default function Navbar({
  actions,
  leftActions,
  rightActions,
  darkMode,
  showAccount = true,
  showHome = true,
  showThemeToggle = true,
  homePlacement = "right",
}: Props) {
  const [accountOpen, setAccountOpen] = useState(false);
  const { darkMode: globalDarkMode, toggleTheme } = useTheme();
  const resolvedDarkMode = darkMode ?? globalDarkMode;
  const hasLeftActions = Boolean(leftActions);
  const resolvedRightActions = rightActions ?? actions;
  const hasRightActions = Boolean(resolvedRightActions);
  const buttonClass = `whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:px-5 sm:py-2.5 sm:text-sm ${
    resolvedDarkMode
      ? "border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
      : "border border-black/8 bg-white/88 text-slate-800 hover:bg-white"
  }`;
  const themeToggle = showThemeToggle ? (
    <button type="button" onClick={toggleTheme} className={buttonClass}>
      <span className="sm:hidden" aria-label={resolvedDarkMode ? "Light Mode" : "Dark Mode"}>
        {resolvedDarkMode ? "☀" : "☾"}
      </span>
      <span className="hidden sm:inline">
        {resolvedDarkMode ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  ) : null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
          resolvedDarkMode
            ? "border-slate-800 bg-slate-900/80"
            : "border-black/6 bg-[#fbfbfd]/80"
        }`}
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="justify-self-start flex items-center gap-2 sm:gap-3">
            {hasLeftActions ? (
              leftActions
            ) : (
              <>
                {showAccount ? (
                  <button
                    onClick={() => setAccountOpen(true)}
                    type="button"
                    className={buttonClass}
                  >
                    Account
                  </button>
                ) : null}

                {showHome && homePlacement === "left" ? (
                  <Link to="/" className={buttonClass}>
                    Home
                  </Link>
                ) : null}
              </>
            )}
          </div>

          <Link to="/" className="justify-self-center flex items-center justify-center">
            <img
              src={resolvedDarkMode ? "/logo_dark.png" : "/logo_light.png"}
              alt="HaerengaNZ"
              className="h-6 object-contain transition-all duration-300 hover:opacity-80 sm:h-7 md:h-8"
            />
          </Link>

          <div className="justify-self-end flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap justify-end">
            {hasRightActions ? (
              <>
                {resolvedRightActions}
                {themeToggle}
              </>
            ) : (
              <>
                {showHome && homePlacement === "right" ? (
                  <Link to="/" className={buttonClass}>
                    Home
                  </Link>
                ) : null}
                {themeToggle}
              </>
            )}
          </div>
        </div>
      </header>

      <div className="h-[4.2rem] sm:h-[4.5rem]" />

      {showAccount ? (
        <Modal isOpen={accountOpen} onClose={() => setAccountOpen(false)}>
          <AccountContent onClose={() => setAccountOpen(false)} />
        </Modal>
      ) : null}
    </>
  );
}
