import { callFunctionsJson } from "./functionsRequest";
import type { Question } from "../types/question";
import type { ModuleAccessRecord, UserPlan } from "../config/access";

type GetQuestionsRequest = {
  subject: "HUBS191" | "CELS191";
  module?: string;
};

type GetQuestionsResponse = {
  questions: Question[];
};

export type UserAccessStateResponse = {
  plan: UserPlan;
  planLabel: string;
  materialsAccess: boolean;
  unlimitedPractice: boolean;
  practiceSubscriptionCurrentPeriodEnd: string | null;
  moduleAccess: ModuleAccessRecord;
};

export type UserPracticeStateResponse = {
  plan: UserPlan;
  unlimitedPractice: boolean;
  progress: Record<string, number>;
  quota: {
    dailyQuestionsUsed: number;
    dailyQuestionsLimit: number;
    dailyExplanationsUsed: number;
    dailyExplanationsLimit: number;
    lastResetDate: string | null;
  };
};

export type AccountPlanStateResponse = {
  plan: UserPlan;
  planLabel: string;
  accessSource: string | null;
};

export async function getQuestions(
  request: GetQuestionsRequest,
): Promise<Question[]> {
  const data = await callFunctionsJson<GetQuestionsResponse>("/getQuestions", {
    method: "POST",
    body: request,
  });

  return Array.isArray(data.questions) ? data.questions : [];
}

export async function getUserAccessState() {
  return callFunctionsJson<UserAccessStateResponse>("/getUserAccessState");
}

export async function getUserPracticeState() {
  return callFunctionsJson<UserPracticeStateResponse>("/getUserPracticeState");
}

export async function getAccountPlanState() {
  return callFunctionsJson<AccountPlanStateResponse>("/getAccountPlanState");
}
