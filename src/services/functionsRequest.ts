import { getToken } from "firebase/app-check";

import { appCheck, auth } from "../firebase";
import { FIREBASE_FUNCTIONS_BASE_URL } from "../config/app";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

let appCheckUnavailableLogged = false;

async function getAppCheckHeaders() {
  if (!appCheck) {
    return {} as Record<string, string>;
  }

  try {
    const { token } = await getToken(appCheck, false);

    return token
      ? {
          "X-Firebase-AppCheck": token,
        }
      : ({} as Record<string, string>);
  } catch (error) {
    if (!appCheckUnavailableLogged) {
      console.warn(
        "App Check token unavailable, continuing without App Check header.",
        error,
      );
      appCheckUnavailableLogged = true;
    }

    return {} as Record<string, string>;
  }
}

export async function callFunctionsJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Not logged in");
  }

  const authToken = await user.getIdToken();
  const appCheckHeaders = await getAppCheckHeaders();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${authToken}`,
    ...appCheckHeaders,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    ...(options.body !== undefined
      ? {
          body: JSON.stringify(options.body),
        }
      : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      (data && typeof data.error === "string" && data.error) ||
        "Request failed",
    );
  }

  return data as T;
}
