import type { ActionCodeSettings } from "firebase/auth";
import { APP_URL } from "../config/app";

function getBaseUrl() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return APP_URL;
}

function getSafeNextPath(nextPath?: string) {
  if (!nextPath?.startsWith("/")) {
    return "";
  }

  if (nextPath.startsWith("//")) {
    return "";
  }

  return nextPath;
}

export function getAuthActionSettings(nextPath?: string): ActionCodeSettings {
  const actionUrl = new URL("/auth/action", getBaseUrl());
  const safeNextPath = getSafeNextPath(nextPath);

  if (safeNextPath) {
    actionUrl.searchParams.set("next", safeNextPath);
  }

  return {
    url: actionUrl.toString(),
    handleCodeInApp: true,
  };
}
