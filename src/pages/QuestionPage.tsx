import { AnimatePresence, motion } from "framer-motion";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import SubjectModal from "../components/SubjectModal";
import {
  EXPLANATION_DAILY_LIMIT,
  QUESTION_DAILY_LIMIT,
} from "../config/app";
import { hasUnlimitedPractice } from "../config/access";
import { THEME } from "../config/theme";
import { auth } from "../firebase";
import { useAccessState } from "../hooks/useAccessState";
import { useTheme } from "../contexts/useTheme";
import {
  type IncrementUsageResponse,
} from "../services/quotaService";
import { getQuestions, getUserPracticeState } from "../services/haerengaBackend";
import { startCheckout } from "../services/checkoutService";
import { callFunctionsJson } from "../services/functionsRequest";
import { recordQuestionProgress } from "../services/userService";

type SubjectType = "HUBS191" | "CELS191";
type DifficultyType = "Mixed" | "Easy" | "Medium" | "Hard";

type Question = {
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
  module: string;
  difficulty: string;
  subject: SubjectType;
};

type UsageState = {
  questionsAnswered: number;
  explanationsUsed: number;
  unlimited: boolean;
  questionLimit: number;
  explanationLimit: number;
};

type FilterState = {
  currentQuestionId: string | null;
  seenIds: string[];
};

type RecentPracticeState = {
  subject: SubjectType;
  module: string;
  difficulty: DifficultyType;
  questionId: string;
  lastPractisedAt: string;
};

type AuthState = "checking" | "ready";

const SUBJECT_STORAGE_KEY = "questionPageSubject";
const STREAK_STORAGE_KEY = "questionPageStreak";
const BEST_STREAK_STORAGE_KEY = "questionPageBestStreak";
const RECENT_PRACTICE_STORAGE_KEY = "questionPageRecentPractice";
const DIFFICULTIES: DifficultyType[] = ["Mixed", "Easy", "Medium", "Hard"];
const QUESTION_LIMIT_MESSAGE =
  "You've used today's free question limit. Upgrade to keep practising.";
const EXPLANATION_LIMIT_MESSAGE =
  "You've used today's free explanation limit. Upgrade to unlock more.";

function getProgressKey(moduleName: string, difficultyName: DifficultyType) {
  return difficultyName === "Mixed"
    ? moduleName
    : `${moduleName}_${difficultyName.toLowerCase()}`;
}

function getNextQuestion(
  pool: Question[],
  seenIds: Set<string>,
  currentId: string | null,
) {
  if (pool.length === 0) {
    return { question: null as Question | null, nextSeenIds: new Set<string>() };
  }

  const unseen = pool.filter((question) => !seenIds.has(question.id));
  const candidates = unseen.length > 0 ? unseen : pool;
  const withoutCurrent =
    candidates.length > 1 && currentId
      ? candidates.filter((question) => question.id !== currentId)
      : candidates;
  const finalCandidates = withoutCurrent.length > 0 ? withoutCurrent : candidates;
  const question =
    finalCandidates[Math.floor(Math.random() * finalCandidates.length)] ?? null;

  const nextSeenIds =
    unseen.length > 0 ? new Set(seenIds) : new Set<string>(question ? [question.id] : []);

  if (question) {
    nextSeenIds.add(question.id);
  }

  return { question, nextSeenIds };
}

function ExplanationSection({
  title,
  body,
}: {
  title: string;
  body: string | null | undefined;
}) {
  if (!body) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </div>
      <p className="mt-3 leading-7">{body}</p>
    </div>
  );
}

function LoadingShell({ label }: { label: string }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.55),transparent_42%),linear-gradient(to_bottom,#0f172a,#020617)] text-slate-100"
          : "bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_40%),linear-gradient(to_bottom,#f8fafc,#ffffff)] text-slate-900"
      }`}
    >
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6">
        <div
          className={`w-full max-w-xl rounded-[2rem] border p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur ${
            darkMode
              ? "border-slate-700/80 bg-slate-900/86"
              : "border-slate-200 bg-white/85"
          }`}
        >
          <div
            className={`mx-auto h-10 w-10 animate-spin rounded-full border-2 ${
              darkMode
                ? "border-slate-700 border-t-slate-200"
                : "border-slate-200 border-t-slate-900"
            }`}
          />
          <p className={`mt-5 text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-500"}`}>
            {label}
          </p>
        </div>
      </main>
    </div>
  );
}

function applyUsageSnapshot(
  previous: UsageState,
  nextUsage?: {
    questionsAnswered?: number;
    explanationsUsed?: number;
    quota?: {
      dailyQuestionsLimit?: number;
      dailyExplanationsLimit?: number;
    };
  } | null,
): UsageState {
  if (!nextUsage) {
    return previous;
  }

  return {
    ...previous,
    questionsAnswered:
      typeof nextUsage.questionsAnswered === "number"
        ? nextUsage.questionsAnswered
        : previous.questionsAnswered,
    explanationsUsed:
      typeof nextUsage.explanationsUsed === "number"
        ? nextUsage.explanationsUsed
        : previous.explanationsUsed,
    questionLimit:
      typeof nextUsage.quota?.dailyQuestionsLimit === "number"
        ? nextUsage.quota.dailyQuestionsLimit
        : previous.questionLimit,
    explanationLimit:
      typeof nextUsage.quota?.dailyExplanationsLimit === "number"
        ? nextUsage.quota.dailyExplanationsLimit
        : previous.explanationLimit,
  };
}

function applyPracticeStateSnapshot(
  nextState: {
    plan?: string;
    unlimitedPractice?: boolean;
    progress?: Record<string, number>;
    quota?: {
      dailyQuestionsUsed?: number;
      dailyQuestionsLimit?: number;
      dailyExplanationsUsed?: number;
      dailyExplanationsLimit?: number;
    };
  },
  setUsage: Dispatch<SetStateAction<UsageState>>,
  setProgress: Dispatch<SetStateAction<Record<string, number>>>,
) {
  const nextProgress =
    nextState.progress && typeof nextState.progress === "object"
      ? nextState.progress
      : {};

  setProgress(nextProgress);
  setUsage((prev) => ({
    ...prev,
    unlimited:
      typeof nextState.unlimitedPractice === "boolean"
        ? nextState.unlimitedPractice
        : hasUnlimitedPractice(nextState.plan),
    questionsAnswered:
      typeof nextState.quota?.dailyQuestionsUsed === "number"
        ? nextState.quota.dailyQuestionsUsed
        : prev.questionsAnswered,
    explanationsUsed:
      typeof nextState.quota?.dailyExplanationsUsed === "number"
        ? nextState.quota.dailyExplanationsUsed
        : prev.explanationsUsed,
    questionLimit:
      typeof nextState.quota?.dailyQuestionsLimit === "number"
        ? nextState.quota.dailyQuestionsLimit
        : prev.questionLimit,
    explanationLimit:
      typeof nextState.quota?.dailyExplanationsLimit === "number"
        ? nextState.quota.dailyExplanationsLimit
        : prev.explanationLimit,
  }));
}

export default function QuestionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const access = useAccessState();
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [user, setUser] = useState<User | null>(null);

  const [subject, setSubject] = useState<SubjectType | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const { darkMode } = useTheme();

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState("");

  const [modules, setModules] = useState<string[]>(["All"]);
  const [activeModule, setActiveModule] = useState("All");
  const [difficulty, setDifficulty] = useState<DifficultyType>("Mixed");

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [upgradePending, setUpgradePending] = useState(false);
  const [answerPending, setAnswerPending] = useState(false);
  const [explanationPending, setExplanationPending] = useState(false);

  const [usage, setUsage] = useState<UsageState>({
    questionsAnswered: 0,
    explanationsUsed: 0,
    unlimited: false,
    questionLimit: QUESTION_DAILY_LIMIT,
    explanationLimit: EXPLANATION_DAILY_LIMIT,
  });
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingMobileModule, setPendingMobileModule] = useState<string | null>(
    null,
  );
  const [pendingMobileDifficulty, setPendingMobileDifficulty] =
    useState<DifficultyType | null>(null);
  const seenQuestionIdsRef = useRef<Set<string>>(new Set());
  const filterStateRef = useRef<Record<string, FilterState>>({});
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const explanationRef = useRef<HTMLDivElement | null>(null);

  const theme = subject ? THEME[subject] : THEME.HUBS191;
  const primaryBtn = darkMode ? theme.primaryDark : theme.primaryLight;
  const gradient = darkMode ? theme.gradientDark : theme.gradientLight;
  const textAccent = darkMode ? theme.textDark : theme.textLight;
  const glow = darkMode ? theme.glowDark : theme.glowLight;

  const requestedSubject =
    searchParams.get("subject") === "CELS191"
      ? "CELS191"
      : searchParams.get("subject") === "HUBS191"
        ? "HUBS191"
        : null;
  const requestedModule = searchParams.get("module");
  const requestedDifficulty = DIFFICULTIES.find(
    (level) => level.toLowerCase() === searchParams.get("difficulty")?.toLowerCase(),
  );
  const unlimitedPractice = access.loading
    ? usage.unlimited
    : access.unlimitedPractice;

  useEffect(() => {
    if (access.loading) return;

    setUsage((prev) =>
      prev.unlimited === access.unlimitedPractice
        ? prev
        : { ...prev, unlimited: access.unlimitedPractice },
    );
  }, [access.loading, access.unlimitedPractice]);

  useEffect(() => {
    if (!unlimitedPractice && difficulty !== "Mixed") {
      setDifficulty("Mixed");
    }
  }, [difficulty, unlimitedPractice]);

  useEffect(() => {
    const savedSubject = localStorage.getItem(SUBJECT_STORAGE_KEY);
    const savedStreak = Number(localStorage.getItem(STREAK_STORAGE_KEY) ?? "0");
    const savedBest = Number(localStorage.getItem(BEST_STREAK_STORAGE_KEY) ?? "0");

    if (requestedSubject) {
      setSubject(requestedSubject);
      localStorage.setItem(SUBJECT_STORAGE_KEY, requestedSubject);
      setShowSubjectModal(false);
    } else if (savedSubject === "HUBS191" || savedSubject === "CELS191") {
      setSubject(savedSubject);
      setShowSubjectModal(false);
    } else {
      setShowSubjectModal(true);
    }

    setStreak(Number.isNaN(savedStreak) ? 0 : savedStreak);
    setBestStreak(Number.isNaN(savedBest) ? 0 : savedBest);
  }, [requestedSubject]);

  useEffect(() => {
    localStorage.setItem(STREAK_STORAGE_KEY, String(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem(BEST_STREAK_STORAGE_KEY, String(bestStreak));
  }, [bestStreak]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        navigate("/login", {
          replace: true,
          state: {
            next: `${location.pathname}${location.search}`,
          },
        });
        return;
      }

      await nextUser.reload();

      if (!nextUser.emailVerified) {
        navigate("/verify-email", {
          replace: true,
          state: {
            email: nextUser.email ?? "",
            source: "login",
            next: `${location.pathname}${location.search}`,
          },
        });
        return;
      }

      await nextUser.getIdToken(true);

      setUser(nextUser);
      setAuthState("ready");
    });

    return () => unsubscribe();
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!user) return;

    let active = true;

    const loadPracticeState = async () => {
      try {
        const practiceData = await getUserPracticeState();

        if (!active) return;

        applyPracticeStateSnapshot(practiceData, setUsage, setProgress);
      } catch (error) {
        console.error("Failed to load practice state:", error);
      }
    };

    void loadPracticeState();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !subject) return;

    let active = true;

    const loadQuestionsOnly = async () => {
      setQuestionsLoading(true);
      setQuestionsError("");
      setActionMessage("");
      setMessageModalOpen(false);

      try {
        const questions = await getQuestions({ subject });

        if (!active) return;

        const uniqueModules = Array.from(
          new Set(questions.map((question) => question.module).filter(Boolean)),
        );
        const sortedModules = uniqueModules.sort((a, b) => {
          const numA = Number.parseInt(a.replace(/\D/g, ""), 10);
          const numB = Number.parseInt(b.replace(/\D/g, ""), 10);

          if (Number.isNaN(numA) || Number.isNaN(numB)) {
            return a.localeCompare(b);
          }

          return numA - numB;
        });

        setAllQuestions(questions);
        setModules(["All", ...sortedModules]);
        setActiveModule(
          requestedModule && sortedModules.includes(requestedModule)
            ? requestedModule
            : "All",
        );
        setDifficulty(
          !unlimitedPractice && requestedDifficulty && requestedDifficulty !== "Mixed"
            ? "Mixed"
            : requestedDifficulty ?? "Mixed",
        );
      } catch (error) {
        console.error("Failed to load question bank:", error);

        if (!active) return;

        setAllQuestions([]);
        setQuestionsError(
          "We couldn't load your question bank right now. Please try again in a moment.",
        );
      } finally {
        if (active) {
          setQuestionsLoading(false);
        }
      }
    };

    void loadQuestionsOnly();

    return () => {
      active = false;
    };
  }, [user, subject, requestedModule, requestedDifficulty, unlimitedPractice]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((question) => {
      const moduleMatches =
        activeModule === "All" ? true : question.module === activeModule;
      const difficultyMatches =
        difficulty === "Mixed"
          ? true
          : question.difficulty === difficulty.toLowerCase();

      return moduleMatches && difficultyMatches;
    });
  }, [allQuestions, activeModule, difficulty]);

  const currentFilterKey = `${subject ?? "none"}::${activeModule}::${difficulty}`;
  const totalQuestions = filteredQuestions.length;
  const progressKey = getProgressKey(activeModule, difficulty);
  const answeredCount = Number(progress[progressKey] ?? 0);
  const progressPercent =
    totalQuestions === 0
      ? 0
      : Math.min((answeredCount / totalQuestions) * 100, 100);

  const smoothScrollToElement = (element: HTMLElement | null, offset = 24) => {
    if (!element || typeof window === "undefined") return;

    const startY = window.scrollY;
    const targetY = Math.max(
      element.getBoundingClientRect().top + window.scrollY - offset,
      0,
    );
    const distance = targetY - startY;

    if (Math.abs(distance) < 12) return;

    const duration = 650;
    let startTime: number | null = null;

    const easeInOutCubic = (progress: number) =>
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  const showMessage = (
    message: string,
    options?: { forceModal?: boolean },
  ) => {
    setActionMessage(message);

    if (
      options?.forceModal ||
      (typeof window !== "undefined" && window.innerWidth < 768)
    ) {
      setMessageModalOpen(true);
    }
  };

  useEffect(() => {
    setSelected(null);
    setShowExplanation(false);
    setActionMessage("");

    if (filteredQuestions.length === 0) {
      filterStateRef.current[currentFilterKey] = {
        currentQuestionId: null,
        seenIds: [],
      };
      seenQuestionIdsRef.current = new Set();
      setCurrentQuestion(null);
      return;
    }

    const savedState = filterStateRef.current[currentFilterKey];
    const savedQuestion =
      savedState?.currentQuestionId
        ? filteredQuestions.find(
            (question) => question.id === savedState.currentQuestionId,
          ) ?? null
        : null;

    if (savedQuestion) {
      seenQuestionIdsRef.current = new Set(savedState.seenIds);
      setCurrentQuestion(savedQuestion);
      return;
    }

    seenQuestionIdsRef.current = new Set(savedState?.seenIds ?? []);

    const { question, nextSeenIds } = getNextQuestion(
      filteredQuestions,
      seenQuestionIdsRef.current,
      null,
    );

    seenQuestionIdsRef.current = nextSeenIds;
    filterStateRef.current[currentFilterKey] = {
      currentQuestionId: question?.id ?? null,
      seenIds: Array.from(nextSeenIds),
    };
    setCurrentQuestion(question);
  }, [currentFilterKey, filteredQuestions]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      setPendingMobileModule(null);
      setPendingMobileDifficulty(null);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (selected === null) return;
    smoothScrollToElement(actionsRef.current, 40);
  }, [selected]);

  useEffect(() => {
    if (!showExplanation) return;
    smoothScrollToElement(explanationRef.current, 40);
  }, [showExplanation]);

  const selectSubject = (nextSubject: SubjectType) => {
    setSubject(nextSubject);
    localStorage.setItem(SUBJECT_STORAGE_KEY, nextSubject);
    setShowSubjectModal(false);
    setAllQuestions([]);
    setModules(["All"]);
    setQuestionsError("");
    setActiveModule("All");
    setDifficulty("Mixed");
    setMobileMenuOpen(false);
    setPendingMobileModule(null);
    setPendingMobileDifficulty(null);
    setCurrentQuestion(null);
    setSelected(null);
    setShowExplanation(false);
    setAnswerPending(false);
    setExplanationPending(false);
    setActionMessage("");
    setMessageModalOpen(false);
  };

  const applySelection = (
    nextModule: string,
    nextDifficulty: DifficultyType = difficulty,
    closeMobile = true,
  ) => {
    if (selected !== null) {
      showMessage("Finish the current question before switching filters.");
      return;
    }

    setActiveModule(nextModule);
    setDifficulty(nextDifficulty);

    if (closeMobile) {
      setMobileMenuOpen(false);
      setPendingMobileModule(null);
      setPendingMobileDifficulty(null);
    }
  };

  const handleMobileModulePick = (nextModule: string) => {
    if (selected !== null) {
      showMessage("Finish the current question before switching filters.");
      return;
    }

    setPendingMobileModule(nextModule);

    if (pendingMobileDifficulty) {
      applySelection(nextModule, pendingMobileDifficulty, true);
    }
  };

  const handleMobileDifficultyPick = (nextDifficulty: DifficultyType) => {
    if (selected !== null) {
      showMessage("Finish the current question before switching filters.");
      return;
    }

    const locked = !unlimitedPractice && nextDifficulty !== "Mixed";
    if (locked) {
      showMessage("Difficulty filters are available on Premium.");
      return;
    }

    setPendingMobileDifficulty(nextDifficulty);

    if (pendingMobileModule) {
      applySelection(pendingMobileModule, nextDifficulty, true);
    }
  };

  const loadNextQuestionNow = () => {
    if (filteredQuestions.length === 0) return;

    const { question, nextSeenIds } = getNextQuestion(
      filteredQuestions,
      seenQuestionIdsRef.current,
      currentQuestion?.id ?? null,
    );

    seenQuestionIdsRef.current = nextSeenIds;
    filterStateRef.current[currentFilterKey] = {
      currentQuestionId: question?.id ?? null,
      seenIds: Array.from(nextSeenIds),
    };
    setCurrentQuestion(question);
    setSelected(null);
    setShowExplanation(false);
    setActionMessage("");
  };

  const handleNextQuestion = () => {
    loadNextQuestionNow();
  };

  const handleUpgrade = async () => {
    setUpgradePending(true);
    setActionMessage("");
    setMessageModalOpen(false);

    try {
      await startCheckout();
    } catch (error) {
      console.error("Upgrade error:", error);
      showMessage(
        "We couldn't open checkout just now. Please try again in a moment.",
      );
    } finally {
      setUpgradePending(false);
    }
  };

  const incrementUsage = async (type: "question" | "explanation") => {
    if (!user) return null;

    return callFunctionsJson<IncrementUsageResponse>("/incrementUsage", {
      method: "POST",
      body: { type },
    });
  };

  const handleAnswer = async (index: number) => {
    if (!currentQuestion || selected !== null || !user || answerPending) return;

    if (!unlimitedPractice && usage.questionsAnswered >= usage.questionLimit) {
      showMessage(QUESTION_LIMIT_MESSAGE, { forceModal: true });
      return;
    }

    const isCorrect = index === currentQuestion.answer;
    const previousStreak = streak;
    const previousBestStreak = bestStreak;

    setSelected(index);
    setActionMessage("");
    setMessageModalOpen(false);

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak(Math.max(bestStreak, nextStreak));
    } else {
      setStreak(0);
    }

    try {
      setAnswerPending(true);

      if (!unlimitedPractice) {
        const incrementData = await incrementUsage("question");

        if (incrementData?.allowed === false) {
          setUsage((prev) => applyUsageSnapshot(prev, incrementData?.usage));
          setSelected(null);
          setStreak(previousStreak);
          setBestStreak(previousBestStreak);
          showMessage(QUESTION_LIMIT_MESSAGE, { forceModal: true });
          return;
        }

        setUsage((prev) => applyUsageSnapshot(prev, incrementData?.usage));
      }

      const actualProgressKey = getProgressKey(currentQuestion.module, difficulty);
      const recentPractice: RecentPracticeState = {
        subject: currentQuestion.subject,
        module: currentQuestion.module,
        difficulty,
        questionId: currentQuestion.id,
        lastPractisedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        RECENT_PRACTICE_STORAGE_KEY,
        JSON.stringify(recentPractice),
      );

      await recordQuestionProgress({
        subject: currentQuestion.subject,
        module: currentQuestion.module,
        difficulty,
        questionId: currentQuestion.id,
        progressKey: actualProgressKey,
        lastPractisedAt: recentPractice.lastPractisedAt,
      });
      setProgress((prev) => ({
        ...prev,
        All: Number(prev.All ?? 0) + 1,
        [actualProgressKey]: Number(prev[actualProgressKey] ?? 0) + 1,
      }));
    } catch (error) {
      console.error("Failed to record answer activity:", error);
      showMessage(
        "Your answer is shown, but we couldn't sync it right now. Please try again in a moment.",
      );
    } finally {
      setAnswerPending(false);
    }
  };

  const handleShowExplanation = async () => {
    if (showExplanation || !user || explanationPending) return;

    if (!unlimitedPractice && usage.explanationsUsed >= usage.explanationLimit) {
      showMessage(EXPLANATION_LIMIT_MESSAGE, { forceModal: true });
      return;
    }

    setActionMessage("");
    setMessageModalOpen(false);

    try {
      setExplanationPending(true);
      setShowExplanation(true);

      if (!unlimitedPractice) {
        const incrementData = await incrementUsage("explanation");

        if (incrementData?.allowed === false) {
          setShowExplanation(false);
          setUsage((prev) => applyUsageSnapshot(prev, incrementData?.usage));
          showMessage(EXPLANATION_LIMIT_MESSAGE, { forceModal: true });
          return;
        }

        setUsage((prev) => applyUsageSnapshot(prev, incrementData?.usage));
      }
    } catch (error) {
      console.error("Failed to record explanation usage:", error);
      setShowExplanation(false);
      showMessage(
        "We couldn't open the explanation right now. Please try again.",
      );
    } finally {
      setExplanationPending(false);
    }
  };

  if (authState === "checking") {
    return <LoadingShell label="Checking your account..." />;
  }

  if (!subject) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode
            ? "bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.55),transparent_42%),linear-gradient(to_bottom,#0f172a,#020617)] text-slate-100"
            : "bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_40%),linear-gradient(to_bottom,#f8fafc,#ffffff)] text-slate-900"
        }`}
      >
        <Navbar />
        <AnimatePresence>
          {showSubjectModal && (
            <SubjectModal darkMode={darkMode} onSelect={selectSubject} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!user) {
    return <LoadingShell label="Preparing your study space..." />;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_40%),linear-gradient(to_bottom,#f8fafc,#ffffff)] text-slate-900"
      }`}
    >
      <Modal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
      >
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Notice</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{actionMessage}</p>
          <button
            type="button"
            onClick={() => setMessageModalOpen(false)}
            className="mt-6 cursor-pointer rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            OK
          </button>
        </div>
      </Modal>

      <Navbar
        darkMode={darkMode}
        homePlacement="left"
        rightActions={
          <>
            <button
              onClick={() => setShowSubjectModal(true)}
              className={`cursor-pointer whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:px-5 sm:py-2.5 sm:text-sm ${
                darkMode
                  ? "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="sm:hidden">Subject</span>
              <span className="hidden sm:inline">Switch Subject</span>
            </button>
          </>
        }
      />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6 lg:px-10">
        <AnimatePresence>
          {showSubjectModal && (
            <SubjectModal darkMode={darkMode} onSelect={selectSubject} />
          )}
        </AnimatePresence>

        {!unlimitedPractice && (
          <div
            className={`mb-5 rounded-[1.5rem] border p-4 md:ml-[19.5rem] md:p-5 ${
              darkMode
                ? "border-amber-900/50 bg-amber-950/30"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 md:text-base">
                  Free plan: 20 questions and 3 explanations per day
                </p>
                <p className={`mt-1 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  Upgrade if you want unlimited practice, explanations, and difficulty filters.
                </p>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={upgradePending}
                className="cursor-pointer rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {upgradePending ? "Opening checkout..." : "Upgrade to Premium"}
              </button>
            </div>
          </div>
        )}

        {actionMessage && (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm md:ml-[19.5rem] ${
              darkMode
                ? "border-slate-800 bg-slate-900/80 text-slate-200"
                : "border-slate-200 bg-white/85 text-slate-700"
            }`}
          >
            {actionMessage}
          </div>
        )}

        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`mb-4 flex w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium ${
              darkMode
                ? "border-slate-800 bg-slate-900 text-slate-100"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <span>
              {pendingMobileModule ?? activeModule} ·{" "}
              {pendingMobileDifficulty ?? difficulty}
            </span>
            <span>{mobileMenuOpen ? "Hide filters" : "Show filters"}</span>
          </button>

          {mobileMenuOpen && (
            <div className="mb-5 space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {modules.map((moduleName) => (
                  <button
                    key={moduleName}
                    onClick={() => handleMobileModulePick(moduleName)}
                    className={`flex-none cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                      (pendingMobileModule ?? activeModule) === moduleName
                        ? darkMode
                          ? "bg-slate-700 text-white ring-1 ring-slate-500 shadow-[0_6px_18px_rgba(15,23,42,0.28)]"
                          : "bg-slate-900 text-white ring-1 ring-slate-700/30 shadow-[0_6px_18px_rgba(15,23,42,0.14)]"
                        : darkMode
                          ? "bg-slate-900 text-slate-200"
                          : "bg-white text-slate-700"
                    }`}
                  >
                    {moduleName}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Difficulty
                </div>
                {!unlimitedPractice && (
                  <div className="rounded-full border border-slate-300/70 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Locked
                  </div>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {DIFFICULTIES.map((level) => {
                  const locked = !unlimitedPractice && level !== "Mixed";

                  return (
                    <button
                      key={level}
                      onClick={() => {
                        handleMobileDifficultyPick(level);
                      }}
                      className={`flex-none cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                        (pendingMobileDifficulty ?? difficulty) === level
                          ? darkMode
                            ? "bg-slate-700 text-white ring-1 ring-slate-500 shadow-[0_6px_18px_rgba(15,23,42,0.28)]"
                            : "bg-slate-900 text-white ring-1 ring-slate-700/30 shadow-[0_6px_18px_rgba(15,23,42,0.14)]"
                          : darkMode
                            ? "bg-slate-900 text-slate-200"
                            : "bg-white text-slate-700"
                      } ${locked ? "opacity-60" : ""}`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="hidden w-64 shrink-0 self-start md:block">
            <div
              className={`fixed top-[5.6rem] w-64 rounded-[1.75rem] border p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ${
                darkMode
                  ? "border-slate-800 bg-slate-900/85"
                  : "border-slate-200/80 bg-white/92"
              }`}
              style={{
                left: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))",
              }}
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Modules
                </div>
                <div className="mt-3 space-y-2">
                  {modules.map((moduleName) => (
                    <button
                      key={moduleName}
                      onClick={() => applySelection(moduleName)}
                      className={`w-full cursor-pointer rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
                        activeModule === moduleName
                          ? "bg-slate-900 text-white shadow-lg"
                          : darkMode
                            ? "bg-slate-950 text-slate-200 hover:bg-slate-950/70"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {moduleName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200/20 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Difficulty
                  </div>
                  {!unlimitedPractice && (
                    <div className="rounded-full border border-slate-700/80 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Locked
                    </div>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {DIFFICULTIES.map((level) => {
                    const locked = !unlimitedPractice && level !== "Mixed";

                    return (
                      <button
                        key={level}
                        onClick={() => {
                          if (locked) {
                            showMessage(
                              "Difficulty filters are available on Premium.",
                            );
                            return;
                          }

                          applySelection(activeModule, level);
                        }}
                        className={`w-full cursor-pointer rounded-xl px-4 py-2 text-left text-sm font-medium transition ${
                          difficulty === level
                            ? "bg-slate-900 text-white shadow-lg"
                            : darkMode
                              ? "bg-slate-950 text-slate-200 hover:bg-slate-950/70"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        } ${locked ? "opacity-60" : ""}`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0 flex-1 md:pl-8">
            <div className="grid grid-cols-3 gap-3 md:grid-cols-[0.8fr_0.95fr_1.1fr] md:gap-3">
              <div
                className={`rounded-[1.2rem] border p-3 md:rounded-[1.1rem] md:p-3 ${
                  darkMode
                    ? "border-slate-800 bg-slate-900/85"
                    : "border-slate-200 bg-white/85"
                }`}
              >
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 md:text-xs md:tracking-[0.24em]">
                  Streak
                </div>
                <div className="mt-1.5 text-xl font-semibold md:mt-1.5 md:text-2xl">
                  {streak}
                </div>
                <p className="mt-0.5 text-xs text-slate-400 md:mt-0.5 md:text-sm">
                  Best: {bestStreak}
                </p>
              </div>

              <div
                className={`rounded-[1.2rem] border p-3 md:rounded-[1.1rem] md:p-3 ${
                  darkMode
                    ? "border-slate-800 bg-slate-900/85"
                    : "border-slate-200 bg-white/85"
                }`}
              >
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 md:text-xs md:tracking-[0.24em]">
                  Today
                </div>
                <div className="mt-1.5 text-xs text-slate-500 md:mt-1.5 md:text-sm">
                  Q: {usage.questionsAnswered}
                  {unlimitedPractice ? " (∞)" : `/${usage.questionLimit}`}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 md:mt-1 md:text-sm">
                  E: {usage.explanationsUsed}
                  {unlimitedPractice ? " (∞)" : `/${usage.explanationLimit}`}
                </div>
              </div>

              <div
                className={`rounded-[1.2rem] border p-3 md:rounded-[1.1rem] md:p-3 ${
                  darkMode
                    ? "border-slate-800 bg-slate-900/85"
                    : "border-slate-200 bg-white/85"
                }`}
              >
                <div
                  className={`text-[10px] uppercase tracking-[0.22em] md:text-xs md:tracking-[0.24em] ${textAccent}`}
                >
                  Attempts
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 md:mt-3 md:h-2">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500 md:mt-2 md:text-sm">
                  {answeredCount}/{totalQuestions}
                </p>
              </div>
            </div>

            <div
              className={`mt-5 rounded-[2rem] border p-6 md:p-8 ${
                darkMode
                  ? "border-slate-800 bg-slate-900/90 text-slate-100 shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
                  : "border-white/40 bg-white/85 text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.08)]"
              }`}
            >
              {questionsLoading ? (
                <div className="py-16 text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
                  <p className="mt-5 text-sm text-slate-500">
                    Loading your {subject} question bank...
                  </p>
                </div>
              ) : questionsError ? (
                <div className="py-12 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Question bank unavailable
                  </h2>
                  <p className="mt-3 text-sm text-slate-500">{questionsError}</p>
                </div>
              ) : !currentQuestion ? (
                <div className="py-12 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    No questions match these filters yet
                  </h2>
                  <p className="mt-3 text-sm text-slate-500">
                    Try switching module or difficulty to open up a larger pool.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    <span>{currentQuestion.module}</span>
                    <span>•</span>
                    <span>{currentQuestion.difficulty || "mixed"}</span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={currentQuestion.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="text-2xl font-semibold leading-relaxed tracking-tight md:text-[2rem]"
                    >
                      {currentQuestion.question}
                    </motion.h2>
                  </AnimatePresence>

                  <div className="mt-8 space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isCorrect = index === currentQuestion.answer;
                      const isSelected = selected === index;

                      return (
                        <motion.button
                          key={`${currentQuestion.id}-${index}`}
                          type="button"
                          onClick={() => handleAnswer(index)}
                          whileHover={selected === null ? { scale: 1.01 } : {}}
                          whileTap={selected === null ? { scale: 0.99 } : {}}
                          disabled={selected !== null || answerPending}
                          className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                            selected === null
                              ? darkMode
                                ? "border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-800/80"
                                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                              : isCorrect
                                ? darkMode
                                  ? "border-green-500/70 bg-green-950/50 text-green-100"
                                  : "border-green-300 bg-green-50 text-slate-900"
                                : isSelected
                                  ? darkMode
                                    ? "border-red-500/70 bg-red-950/50 text-red-100"
                                    : "border-red-300 bg-red-50 text-slate-900"
                                  : darkMode
                                    ? "border-slate-800 bg-slate-900 text-slate-500 opacity-50"
                                    : "border-slate-200 bg-slate-50 text-slate-400 opacity-60"
                          } ${
                            selected === null && !answerPending
                              ? "cursor-pointer"
                              : "cursor-default"
                          }`}
                        >
                          <span className="pr-4">{option}</span>
                          <span className="text-lg font-semibold">
                            {selected !== null
                              ? isCorrect
                                ? "✓"
                                : isSelected
                                  ? "✕"
                                  : ""
                              : ""}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {selected !== null && selected === currentQuestion.answer && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-[2rem]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.14 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
                      }}
                    />
                  )}

                  {showExplanation && (
                    <motion.div
                      ref={explanationRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-8 rounded-2xl border p-5 ${
                        darkMode
                          ? "border-slate-700 bg-slate-800 text-slate-100"
                          : "border-slate-200 bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Explanation
                      </div>
                      <p className="mt-3 leading-7">{currentQuestion.explanation}</p>

                      {(currentQuestion.answerWhy ||
                        currentQuestion.conceptFocus ||
                        currentQuestion.commonTrap ||
                        currentQuestion.examTakeaway ||
                        currentQuestion.proTips) && (
                        <div
                          className={`mt-6 border-t pt-5 ${
                            darkMode ? "border-slate-700" : "border-slate-200/70"
                          }`}
                        >
                          <ExplanationSection
                            title="Why This Answer Is Correct"
                            body={currentQuestion.answerWhy}
                          />
                          <ExplanationSection
                            title="What This Question Is Testing"
                            body={currentQuestion.conceptFocus}
                          />
                          <ExplanationSection
                            title="Common Trap"
                            body={currentQuestion.commonTrap}
                          />
                          <ExplanationSection
                            title="Exam Takeaway"
                            body={currentQuestion.examTakeaway}
                          />
                          <ExplanationSection
                            title="Pro Tips"
                            body={currentQuestion.proTips}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {selected !== null && (
                    <motion.div
                      ref={actionsRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 flex flex-col gap-3 sm:flex-row"
                    >
                      {!showExplanation && (
                        <button
                          type="button"
                          onClick={handleShowExplanation}
                          className={`flex-1 rounded-full py-3 text-sm font-semibold text-white transition ${
                            explanationPending
                              ? `${primaryBtn} cursor-wait opacity-85`
                              : `${primaryBtn} cursor-pointer touch-manipulation`
                          }`}
                        >
                          {explanationPending ? "Opening..." : "Show Explanation"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className={`flex-1 rounded-full py-3 text-sm font-semibold text-white transition ${
                          `${primaryBtn} cursor-pointer touch-manipulation`
                        }`}
                      >
                        Next Question
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
