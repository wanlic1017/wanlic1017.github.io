import { AnimatePresence, motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";

import { getPlanLabel, type UserPlan } from "../config/access";
import { auth } from "../firebase";
import { getAccountPlanState } from "../services/haerengaBackend";

type PlanSnapshot = {
  initialized: boolean;
  plan: UserPlan;
  accessSource: string | null;
};

type NoticeState = {
  planLabel: string;
  accessSource: string | null;
};

export default function PlanChangeNotice() {
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const previousSnapshotRef = useRef<PlanSnapshot>({
    initialized: false,
    plan: "free",
    accessSource: null,
  });

  useEffect(() => {
    let active = true;
    let currentUid: string | null = null;

    const refreshPlanState = async () => {
      if (!currentUid) return;

      try {
        const data = await getAccountPlanState();

        if (!active || !currentUid) return;

        const plan = data.plan;
        const accessSource = data.accessSource;
        const previousSnapshot = previousSnapshotRef.current;

        if (
          previousSnapshot.initialized &&
          (previousSnapshot.plan !== plan ||
            previousSnapshot.accessSource !== accessSource)
        ) {
          setNotice({
            planLabel: data.planLabel || getPlanLabel(plan),
            accessSource,
          });
        }

        previousSnapshotRef.current = {
          initialized: true,
          plan,
          accessSource,
        };
      } catch {
        // Leave the previous snapshot untouched if this refetch fails.
      }
    };

    const handleWindowRefresh = () => {
      void refreshPlanState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleWindowRefresh();
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setNotice(null);
      previousSnapshotRef.current = {
        initialized: false,
        plan: "free",
        accessSource: null,
      };

      currentUid = user?.uid ?? null;

      if (!user) return;

      void refreshPlanState();
    });

    window.addEventListener("focus", handleWindowRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = window.setInterval(() => {
      void refreshPlanState();
    }, 30000);

    return () => {
      active = false;
      window.removeEventListener("focus", handleWindowRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timeoutId = window.setTimeout(() => {
      setNotice(null);
    }, 5200);

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  return (
    <AnimatePresence>
      {notice ? (
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="fixed inset-x-0 top-[5.2rem] z-[80] flex justify-center px-4"
        >
          <div className="w-full max-w-[22rem] rounded-[1.7rem] border border-slate-200/80 bg-white/92 px-5 py-4 text-center !text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/12 dark:bg-slate-950/88 dark:!text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.36)]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] !text-slate-500 dark:!text-white/55">
              Plan Updated
            </div>
            <p className="mt-2 text-[0.98rem] font-medium tracking-[-0.01em] !text-slate-950 dark:!text-white">
              Your plan is now {notice.planLabel}.
            </p>
            {notice.accessSource ? (
              <p className="mt-1 text-xs leading-5 !text-slate-500 dark:!text-white/65">
                Source: {notice.accessSource}
              </p>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
