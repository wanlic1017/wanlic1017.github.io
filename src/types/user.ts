export type UserUsage = {
  lastResetDate: string;
  questionsUsedToday: number;
  explanationsUsedToday: number;
  seenQuestionIdsToday: string[];
};

export type AppUser = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  emailVerified: boolean;
  plan: "free" | "materials" | "practice" | "full" | "pro";
  accessSource?: string;
  moduleAccess?:
    | string[]
    | Record<string, boolean | string | string[] | Record<string, boolean | string>>;
  createdAt: number;
  usage?: UserUsage;
};
