export type Question = {
  id: string;
  subject: "HUBS191" | "CELS191";
  module: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
};