export type PaymentProviderName = "MANUAL";

export type PendingPaymentRequest = {
  reservationCode: string;
  amountCents: number;
  currency: string;
};

export type PendingPaymentResult = {
  provider: PaymentProviderName;
  status: "PENDING";
  amountCents: number;
  currency: string;
  externalRef: string | null;
};

/**
 * Builds the pending payment payload persisted with a reservation.
 *
 * Providers used in the booking repository must be pure/manual payload builders:
 * they must not capture funds, create external checkout sessions, or perform
 * other external side effects. External payment integration belongs after the
 * reservation has been persisted and the provider contract is expanded.
 */
export type PaymentProvider = {
  name: PaymentProviderName;
  createPendingPayment(request: PendingPaymentRequest): PendingPaymentResult | Promise<PendingPaymentResult>;
};
