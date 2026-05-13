import { createContext } from "react";

export type ThemeContextValue = {
  darkMode: boolean;
  setDarkMode: (next: boolean | ((previous: boolean) => boolean)) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
