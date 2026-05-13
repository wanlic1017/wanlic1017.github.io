export type Question = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  answerWhy?: string | null;
  conceptFocus?: string | null;
  commonTrap?: string | null;
  examTakeaway?: string | null;
  proTips?: string | null;
  subject: "HUBS191" | "CELS191";
  module: string;
  difficulty: string;
};
