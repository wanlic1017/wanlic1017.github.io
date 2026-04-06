import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";


// ✅ CREATE USER DOCUMENT (on register)
export const createUserDocument = async (
  userId: string,
  email: string
) => {
  const today = new Date().toISOString().split("T")[0];

  await setDoc(doc(db, "users", userId), {
    email,
    plan: "free", // 🔥 important for later subscription logic
    createdAt: new Date(),
    usage: {
      lastResetDate: today,
      questionsUsedToday: 0,
      explanationsUsedToday: 0,
      seenQuestionIdsToday: [],
    },
  });
};


// ✅ DAILY RESET LOGIC
export const checkAndResetDailyUsage = async (userId: string) => {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();
  const today = new Date().toISOString().split("T")[0];

  if (data.usage.lastResetDate !== today) {
    await updateDoc(ref, {
      "usage.lastResetDate": today,
      "usage.questionsUsedToday": 0,
      "usage.explanationsUsedToday": 0,
      "usage.seenQuestionIdsToday": [],
    });
  }
};


// ✅ INCREMENT QUESTION USAGE (WITH LIMIT + TRACK SEEN)
export const incrementQuestionUsage = async (
  userId: string,
  questionId: string
) => {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  // 🔒 FREE LIMIT: 20 questions/day
  if (data.plan === "free" && data.usage.questionsUsedToday >= 20) {
    throw new Error("Daily question limit reached");
  }

  await updateDoc(ref, {
    "usage.questionsUsedToday": data.usage.questionsUsedToday + 1,
    "usage.seenQuestionIdsToday": [
      ...(data.usage.seenQuestionIdsToday || []),
      questionId,
    ],
  });
};


// ✅ INCREMENT EXPLANATION USAGE (WITH LIMIT)
export const incrementExplanationUsage = async (userId: string) => {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  // 🔒 FREE LIMIT: 3 explanations/day
  if (data.plan === "free" && data.usage.explanationsUsedToday >= 3) {
    throw new Error("Explanation limit reached (3/day)");
  }

  await updateDoc(ref, {
    "usage.explanationsUsedToday":
      data.usage.explanationsUsedToday + 1,
  });
};