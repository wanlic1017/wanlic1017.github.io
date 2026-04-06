export type UserUsage = {
  lastResetDate: string;
  questionsUsedToday: number;
  explanationsUsedToday: number;
  seenQuestionIdsToday: string[];
};

export type AppUser = {
  uid: string;
  email: string;
  plan: "free" | "pro";
  createdAt: number;
  usage: UserUsage;
};