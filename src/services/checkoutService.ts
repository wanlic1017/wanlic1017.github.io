import { callFunctionsJson } from "./functionsRequest";

export type CheckoutRequest =
  | {
      purchaseType: "practice" | "full";
    }
  | {
      purchaseType: "module";
      subjectSlug: string;
      moduleSlug: string;
    };

export const startCheckout = async (
  checkoutRequest: CheckoutRequest = { purchaseType: "practice" },
) => {
  const data = await callFunctionsJson<{ url?: string }>(
    "/createCheckoutSession",
    {
      method: "POST",
      body: checkoutRequest,
    },
  );

  if (!data.url) {
    throw new Error("No checkout URL returned");
  }

  window.location.href = data.url;
};
