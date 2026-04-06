import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { getNextQuestion } from "../services/questionService";
import {
  incrementQuestionUsage,
  incrementExplanationUsage,
  checkAndResetDailyUsage,
} from "../services/userService";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Question } from "../types/question";

export default function QuestionPage() {
  const { user } = useContext(AuthContext);

  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load seen questions from Firestore
  const loadSeenIds = async () => {
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));
    const data = snap.data();

    setSeenIds(data?.usage?.seenQuestionIdsToday || []);
  };

  // ✅ Load next question
  const loadQuestion = async () => {
    if (!user) return;

    setLoading(true);

    const q = await getNextQuestion("mixed", "mixed", seenIds);

    setQuestion(q);
    setSelected(null);
    setShowResult(false);
    setLoading(false);
  };

  // ✅ Initial setup
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      await checkAndResetDailyUsage(user.uid);
      await loadSeenIds();
    };

    init();
  }, [user]);

  // ✅ Load question after seenIds ready
  useEffect(() => {
    if (user) {
      loadQuestion();
    }
  }, [seenIds]);

  // ✅ Submit answer
  const handleSubmit = async () => {
    if (!user || !question || !selected) return;

    try {
      await incrementQuestionUsage(user.uid, question.id);
      await incrementExplanationUsage(user.uid);

      setSeenIds((prev) => [...prev, question.id]);
      setShowResult(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 🔒 NOT LOGGED IN (FULL UX FIX)
  if (!user) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-lg">Please log in to access questions</p>

        <Link
          to="/login"
          className="bg-black text-white px-4 py-2 inline-block"
        >
          Go to Login
        </Link>

        <div className="mt-4">
          <Link to="/register" className="underline text-sm">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    );
  }

  // ⏳ Loading
  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  // ❌ No questions left
  if (!question) {
    return (
      <div className="p-10 text-center">
        <p>No more questions available today</p>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h2 className="text-lg mb-4">{question.question}</h2>

      {Object.entries(question.options).map(([key, value]) => (
        <button
          key={key}
          className={`border p-2 w-full text-left mb-2 ${
            selected === key ? "bg-gray-200" : ""
          }`}
          onClick={() => setSelected(key)}
        >
          {key}. {value}
        </button>
      ))}

      <button
        className="bg-black text-white px-4 py-2 mt-4 w-full"
        onClick={handleSubmit}
      >
        Submit
      </button>

      {showResult && (
        <div className="mt-4">
          {selected === question.correct ? (
            <p className="text-green-600 font-semibold">Correct</p>
          ) : (
            <p className="text-red-600 font-semibold">
              Incorrect. Answer: {question.correct}
            </p>
          )}

          <p className="mt-2">{question.explanation}</p>

          <button
            className="mt-4 underline"
            onClick={loadQuestion}
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}