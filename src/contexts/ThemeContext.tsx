import { type ReactNode, useEffect, useMemo, useState } from "react";

import { ThemeContext } from "./theme-context";

const THEME_STORAGE_KEY = "darkMode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;

    const savedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedMode !== null) return savedMode === "true";

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, String(darkMode));
  }, [darkMode]);

  const value = useMemo(
    () => ({
      darkMode,
      setDarkMode,
      toggleTheme: () => setDarkMode((previous) => !previous),
    }),
    [darkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
