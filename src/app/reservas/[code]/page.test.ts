import { describe, expect, it } from "vitest";
import { manualBankDetails } from "@/lib/payments/manual-bank-details";
import { formatDateTime, statusCopy, statusHeading } from "./page";

describe("reservation confirmation status copy", () => {
  it("keeps planned heading text for pending manual-payment reservations without saying they are fully paid", () => {
    expect(statusHeading("PENDING_PAYMENT")).toBe("Reserva confirmada");
    expect(statusCopy("PENDING_PAYMENT")).toContain("pago queda pendiente de confirmacion manual");
  });

  it("uses explicit headings for confirmed, cancelled, and unknown statuses", () => {
    expect(statusHeading("CONFIRMED")).toBe("Reserva confirmada");
    expect(statusHeading("CANCELLED")).toBe("Reserva cancelada");
    expect(statusHeading("REVIEW")).toBe("Reserva recibida");
  });

  it("formats departure times in the Salta timezone", () => {
    expect(formatDateTime("2026-06-01T12:00:00.000Z")).toMatch(/\b9:00\b/);
  });

  it("exposes hardcoded test bank details for manual payments", () => {
    expect(manualBankDetails).toEqual({
      holder: "Araucana Viajes Test",
      bank: "Banco de Prueba",
      accountType: "Cuenta corriente en pesos",
      cbu: "0000003100012345678901",
      alias: "ARAUCANA.TEST.PAGO",
      cuit: "30-00000000-1"
    });
  });
});
