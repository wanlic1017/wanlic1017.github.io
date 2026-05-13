function getOptionalFirebaseEnv(name: keyof ImportMetaEnv) {
  return import.meta.env[name]?.trim() || "";
}

function getBooleanFirebaseEnv(name: keyof ImportMetaEnv) {
  return getOptionalFirebaseEnv(name).toLowerCase() === "true";
}

export const firebaseWebConfig = {
  apiKey: getOptionalFirebaseEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getOptionalFirebaseEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getOptionalFirebaseEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getOptionalFirebaseEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getOptionalFirebaseEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getOptionalFirebaseEnv("VITE_FIREBASE_APP_ID"),
  measurementId: getOptionalFirebaseEnv("VITE_FIREBASE_MEASUREMENT_ID") || undefined,
};

export const firebaseAppCheckSiteKey = getOptionalFirebaseEnv(
  "VITE_FIREBASE_APPCHECK_SITE_KEY",
);

export const firebaseAppCheckDebugToken = getOptionalFirebaseEnv(
  "VITE_FIREBASE_APPCHECK_DEBUG_TOKEN",
);

export const firebaseAppCheckEnabled = getBooleanFirebaseEnv(
  "VITE_FIREBASE_APPCHECK_ENABLED",
);
