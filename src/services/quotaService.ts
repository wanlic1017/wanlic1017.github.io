import { callFunctionsJson } from "./functionsRequest";

export type UsageResponse = {
  questionsAnswered: number;
  explanationsUsed: number;
  unlimited: boolean;
  quota?: {
    dailyQuestionsLimit?: number;
    dailyExplanationsLimit?: number;
  };
};

export type IncrementUsageResponse = {
  allowed?: boolean;
  usage?: UsageResponse;
  success?: boolean;
  reason?: string;
};

export const checkQuestionQuota = async () => {
  return callFunctionsJson<IncrementUsageResponse>("/checkQuota", {
    method: "POST",
    body: { type: "question" },
  });
};

export const checkExplanationQuota = async () => {
  return callFunctionsJson<IncrementUsageResponse>("/checkQuota", {
    method: "POST",
    body: { type: "explanation" },
  });
};

export const getUsage = async () => {
  return callFunctionsJson<UsageResponse>("/getUsage");
};
