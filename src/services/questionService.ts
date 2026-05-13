import { getQuestions } from "./haerengaBackend";
import type { Question } from "../types/question";

export async function getQuestionsByModule(module: string): Promise<Question[]> {
  return getQuestions({
    subject: "HUBS191",
    module,
  });
}
