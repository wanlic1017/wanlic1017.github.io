import { initializeApp, getApps } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";
import { getAuth } from "firebase/auth";
import {
  firebaseAppCheckEnabled,
  firebaseAppCheckDebugToken,
  firebaseAppCheckSiteKey,
  firebaseWebConfig,
} from "./config/firebase";

const app = getApps().length ? getApps()[0] : initializeApp(firebaseWebConfig);
let appCheck: AppCheck | null = null;

if (
  typeof window !== "undefined" &&
  firebaseAppCheckEnabled &&
  firebaseAppCheckSiteKey
) {
  if (firebaseAppCheckDebugToken) {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = firebaseAppCheckDebugToken;
  }

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(firebaseAppCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = getAuth(app);
export { appCheck };
