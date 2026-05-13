export type SubjectType = "HUBS191" | "CELS191";

export const THEME = {
  HUBS191: {
    primaryLight: "bg-blue-900 text-blue-100 hover:bg-blue-800",
    primaryDark: "bg-blue-950 text-blue-200 hover:bg-blue-900",

    gradientLight: "from-blue-900 to-blue-800",
    gradientDark: "from-blue-800 to-indigo-700",

    textLight: "text-blue-500",
    textDark: "text-blue-300",

    glowLight: "rgba(59,130,246,0.25)",
    glowDark: "rgba(30,64,175,0.25)",
  },

  CELS191: {
    primaryLight: "bg-green-900 text-green-100 hover:bg-green-800",
    primaryDark: "bg-green-950 text-green-200 hover:bg-green-900",

    gradientLight: "from-green-900 to-green-800",
    gradientDark: "from-green-800 to-emerald-700",

    textLight: "text-green-500",
    textDark: "text-green-300",

    glowLight: "rgba(34,197,94,0.25)",
    glowDark: "rgba(22,101,52,0.25)",
  },
} as const;
