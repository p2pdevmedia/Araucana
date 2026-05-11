import { describe, expect, it } from "vitest";
import { filterBookableSchedules, formatDateTime } from "./checkout-form";
import type { PublicRouteDto, ScheduleOptionDto, SeatMapDto } from "@/lib/booking/types";

const route: PublicRouteDto = {
  id: "route-1",
  slug: "sma-bariloche",
  from: "San Martin de los Andes",
  to: "Bariloche",
  via: "Camino de los 7 Lagos",
  description: "Ruta escenica",
  category: "Argentina",
  featured: true,
  durationMin: 270,
  priceCents: 1890000,
  price: 18900,
  currency: "ARS",
  stops: []
};

function schedule(id: string, status: string): ScheduleOptionDto {
  return {
    id,
    route,
    departureAt: new Date("2026-06-01T12:00:00.000Z"),
    arrivalAt: new Date("2026-06-01T16:30:00.000Z"),
    status,
    availableSeats: 2,
    totalSeats: 2,
    priceCents: 1890000,
    price: 18900,
    currency: "ARS"
  };
}

function seatMap(scheduleId: string): SeatMapDto {
  return {
    scheduleId,
    vehicleId: "vehicle-1",
    seats: []
  };
}

describe("checkout schedule helpers", () => {
  it("keeps only open and documentation schedules with matching seat maps", () => {
    const result = filterBookableSchedules(
      [schedule("open", "OPEN"), schedule("docs", "DOCUMENTATION"), schedule("closed", "CLOSED")],
      [seatMap("open"), seatMap("docs"), seatMap("closed")]
    );

    expect(result.schedules.map((item) => item.id)).toEqual(["open", "docs"]);
    expect(result.seatMaps.map((item) => item.scheduleId)).toEqual(["open", "docs"]);
  });

  it("formats departure times in the Salta timezone", () => {
    expect(formatDateTime("2026-06-01T12:00:00.000Z")).toMatch(/\b9:00\b/);
  });
});
