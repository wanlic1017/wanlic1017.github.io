import { callFunctionsJson } from "./functionsRequest";

export const openBillingPortal = async () => {
  const data = await callFunctionsJson<{ url?: string }>("/createPortalSession", {
    method: "POST",
  });

  if (!data.url) {
    throw new Error("No portal URL returned");
  }

  window.location.href = data.url;
};
