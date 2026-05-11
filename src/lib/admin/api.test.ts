import { describe, expect, it } from "vitest";
import {
  adminRouteInputSchema,
  adminScheduleInputSchema,
  adminVehicleInputSchema,
  normalizeReservationCode
} from "./api";

describe("admin api contracts", () => {
  it("normalizes reservation codes for mobile requests", () => {
    expect(normalizeReservationCode(" ab12cd ")).toBe("AB12CD");
  });

  it("accepts route payloads with cents-based pricing", () => {
    const parsed = adminRouteInputSchema.parse({
      from: "SMA",
      to: "Bariloche",
      via: "Ruta 40",
      durationMin: 270,
      priceCents: 1890000,
      currency: "ARS",
      category: "Argentina",
      description: "Ruta escenica",
      featured: true,
      isActive: true,
      stops: [{ name: "Villa La Angostura", km: 110, minutes: 120, note: "Parada" }]
    });

    expect(parsed.slug).toBe("sma-bariloche-ruta-40");
    expect(parsed.priceCents).toBe(1890000);
  });

  it("accepts schedule payloads with ISO dates", () => {
    const parsed = adminScheduleInputSchema.parse({
      routeId: "route-1",
      vehicleId: "vehicle-1",
      departureAt: "2026-11-12T11:30:00.000Z",
      status: "OPEN"
    });

    expect(parsed.departureAt.toISOString()).toBe("2026-11-12T11:30:00.000Z");
  });

  it("accepts vehicle payloads with native JSON seats", () => {
    const parsed = adminVehicleInputSchema.parse({
      name: "Araucana 24",
      brand: "Mercedes-Benz",
      model: "Sprinter",
      licensePlate: "AE 123 AR",
      templateKey: null,
      isActive: true,
      seats: [
        { number: "01", row: 1, column: 1 },
        { number: "02", row: 1, column: 2 }
      ]
    });

    expect(parsed.seats).toHaveLength(2);
  });
});
