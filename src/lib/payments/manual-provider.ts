import type { PaymentProvider } from "./types";

export const manualPaymentProvider: PaymentProvider = {
  name: "MANUAL",
  createPendingPayment(request) {
    return {
      provider: "MANUAL",
      status: "PENDING",
      amountCents: request.amountCents,
      currency: request.currency,
      externalRef: null
    };
  }
};
