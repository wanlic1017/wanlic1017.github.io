function getOptionalFirebaseEnv(name: keyof ImportMetaEnv) {
  return import.meta.env[name]?.trim() || "";
}

function getBooleanFirebaseEnv(name: keyof ImportMetaEnv) {
  return getOptionalFirebaseEnv(name).toLowerCase() === "true";
}

export const firebaseWebConfig = {
  apiKey:
    getOptionalFirebaseEnv("VITE_FIREBASE_API_KEY") ||
    "AIzaSyDrC3BXV7z41IzJ_2oerBc4YDsqWBVIuQM",
  authDomain:
    getOptionalFirebaseEnv("VITE_FIREBASE_AUTH_DOMAIN") ||
    "haerenganz-app.firebaseapp.com",
  projectId:
    getOptionalFirebaseEnv("VITE_FIREBASE_PROJECT_ID") || "haerenganz-app",
  storageBucket:
    getOptionalFirebaseEnv("VITE_FIREBASE_STORAGE_BUCKET") ||
    "haerenganz-app.firebasestorage.app",
  messagingSenderId:
    getOptionalFirebaseEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || "516721277681",
  appId:
    getOptionalFirebaseEnv("VITE_FIREBASE_APP_ID") ||
    "1:516721277681:web:4fd365c690ef0885210750",
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
