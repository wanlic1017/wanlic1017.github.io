import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Question } from "../types/question";

// 🔥 Fetch all questions (we'll optimise later)
export const getAllQuestions = async (): Promise<Question[]> => {
  const snapshot = await getDocs(collection(db, "questions"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];
};

// 🔥 Get next question (core logic)
export const getNextQuestion = async (
  module: string | "mixed",
  difficulty: string | "mixed",
  seenIds: string[]
): Promise<Question | null> => {
  const allQuestions = await getAllQuestions();

  let filtered = allQuestions;

  // filter module
  if (module !== "mixed") {
    filtered = filtered.filter((q) => q.module === module);
  }

  // filter difficulty (only applies if selected)
  if (difficulty !== "mixed") {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }

  // remove seen questions
  const available = filtered.filter((q) => !seenIds.includes(q.id));

  if (available.length === 0) return null;

  // random pick
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
};