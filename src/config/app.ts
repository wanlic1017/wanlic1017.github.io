export const APP_URL =
  import.meta.env.VITE_APP_URL?.trim() || "https://haerenganz.com";

export const FIREBASE_FUNCTIONS_BASE_URL =
  import.meta.env.VITE_FUNCTIONS_BASE_URL?.trim() ||
  "https://us-central1-haerenganz-app.cloudfunctions.net";

export const APP_TIME_ZONE = "Pacific/Auckland";
export const QUESTION_DAILY_LIMIT = 20;
export const EXPLANATION_DAILY_LIMIT = 3;
