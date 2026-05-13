import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import {
  canAccessMaterials,
  getPlanLabel,
  hasModuleAccess,
  mergeWithDefaultModuleAccess,
  type ModuleAccessRecord,
  type UserPlan,
} from "../config/access";
import { auth } from "../firebase";
import { getUserAccessState } from "../services/haerengaBackend";

type AccessState = {
  loading: boolean;
  signedIn: boolean;
  plan: UserPlan;
  planLabel: string;
  materialsAccess: boolean;
  unlimitedPractice: boolean;
  practiceSubscriptionCurrentPeriodEnd: Date | null;
  moduleAccess: ModuleAccessRecord;
  canAccessModule: (subjectSlug: string, moduleSlug: string) => boolean;
};

const defaultState: AccessState = {
  loading: true,
  signedIn: false,
  plan: "free",
  planLabel: "Free",
  materialsAccess: false,
  unlimitedPractice: false,
  practiceSubscriptionCurrentPeriodEnd: null,
  moduleAccess: null,
  canAccessModule: () => false,
};

export function useAccessState() {
  const [state, setState] = useState<AccessState>(defaultState);

  useEffect(() => {
    let active = true;
    let currentUid: string | null = null;

    const applySignedOutState = () => {
      if (!active) return;

      setState({
        loading: false,
        signedIn: false,
        plan: "free",
        planLabel: "Free",
        materialsAccess: false,
        unlimitedPractice: false,
        practiceSubscriptionCurrentPeriodEnd: null,
        moduleAccess: null,
        canAccessModule: () => false,
      });
    };

    const loadState = async () => {
      if (!currentUid) {
        applySignedOutState();
        return;
      }

      try {
        const data = await getUserAccessState();

        if (!active || !currentUid) return;

        const moduleAccess = mergeWithDefaultModuleAccess(data.moduleAccess);
        const materialsAccess = canAccessMaterials(data.plan);
        const practiceSubscriptionCurrentPeriodEnd =
          data.practiceSubscriptionCurrentPeriodEnd
            ? new Date(data.practiceSubscriptionCurrentPeriodEnd)
            : null;

        setState({
          loading: false,
          signedIn: true,
          plan: data.plan,
          planLabel: data.planLabel || getPlanLabel(data.plan),
          materialsAccess,
          unlimitedPractice: data.unlimitedPractice,
          practiceSubscriptionCurrentPeriodEnd,
          moduleAccess,
          canAccessModule: (subjectSlug, moduleSlug) =>
            materialsAccess ||
            hasModuleAccess(moduleAccess, subjectSlug, moduleSlug),
        });
      } catch {
        if (!active || !currentUid) return;

        setState({
          loading: false,
          signedIn: true,
          plan: "free",
          planLabel: "Free",
          materialsAccess: false,
          unlimitedPractice: false,
          practiceSubscriptionCurrentPeriodEnd: null,
          moduleAccess: null,
          canAccessModule: () => false,
        });
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        currentUid = null;
        applySignedOutState();
        return;
      }

      currentUid = user.uid;
      setState((prev) => ({ ...prev, loading: true, signedIn: true }));
      void loadState();
    });

    return () => {
      active = false;
      unsubscribeAuth();
    };
  }, []);

  return state;
}
