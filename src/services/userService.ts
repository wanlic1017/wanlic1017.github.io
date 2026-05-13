import { callFunctionsJson } from "./functionsRequest";
import { auth } from "../firebase";

type UserProfileOverrides = {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  emailVerified?: boolean;
};

export const ensureUserDocument = async (
  _uid: string,
  email: string,
  overrides: UserProfileOverrides = {},
) => {
  await callFunctionsJson("/upsertUserProfile", {
    method: "POST",
    body: {
      email,
      firstName: overrides.firstName,
      lastName: overrides.lastName,
      phone: overrides.phone,
      emailVerified: overrides.emailVerified ?? false,
    },
  });
};

export const syncEmailVerification = async (_uid: string, verified: boolean) => {
  await callFunctionsJson("/upsertUserProfile", {
    method: "POST",
    body: {
      emailVerified: verified,
      email: auth.currentUser?.email || "",
    },
  });
};

type RecordQuestionProgressPayload = {
  subject: string;
  module: string;
  difficulty: string;
  questionId: string;
  progressKey: string;
  lastPractisedAt: string;
};

export const recordQuestionProgress = async (
  payload: RecordQuestionProgressPayload,
) => {
  await callFunctionsJson("/recordQuestionProgress", {
    method: "POST",
    body: payload,
  });
};
