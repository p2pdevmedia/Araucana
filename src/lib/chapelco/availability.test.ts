import { describe, expect, test } from "vitest";
import {
  availablePeople,
  blockingReservedPeopleForSlot,
  canReservePeople,
  reservedPeopleForSlot,
  vehicleCanServeSlot,
  vehicleCapacityCountsForSlot
} from "./availability";

describe("vehicleCanServeSlot", () => {
  test("blocks the immediately following ascent slot", () => {
    expect(vehicleCanServeSlot(["08:30"], "09:00")).toBe(false);
    expect(vehicleCanServeSlot(["09:00"], "10:30")).toBe(false);
    expect(vehicleCanServeSlot(["10:30"], "12:00")).toBe(false);
  });

  test("allows the next non-adjacent ascent slot", () => {
    expect(vehicleCanServeSlot(["08:30"], "10:30")).toBe(true);
    expect(vehicleCanServeSlot(["09:00"], "12:00")).toBe(true);
  });
});

describe("capacity rules", () => {
  test("counts a vehicle for its own assigned slot but not the adjacent blocked slot", () => {
    expect(vehicleCapacityCountsForSlot(["08:30"], "08:30")).toBe(true);
    expect(vehicleCapacityCountsForSlot(["08:30"], "09:00")).toBe(false);
    expect(vehicleCapacityCountsForSlot(["08:30"], "10:30")).toBe(true);
  });

  test("allows reservations that fit in remaining capacity", () => {
    expect(canReservePeople(19, 15, 4)).toBe(true);
  });

  test("blocks reservations that exceed remaining capacity", () => {
    expect(canReservePeople(19, 16, 4)).toBe(false);
  });

  test("never returns negative availability", () => {
    expect(availablePeople(19, 25)).toBe(0);
  });

  test("counts same-slot reservations separately from adjacent blocking reservations", () => {
    const reservations = [
      { ascentSlot: "08:30" as const, passengerCount: 10 },
      { ascentSlot: "09:00" as const, passengerCount: 5 },
      { ascentSlot: "10:30" as const, passengerCount: 3 }
    ];

    expect(reservedPeopleForSlot(reservations, "09:00")).toBe(5);
    expect(blockingReservedPeopleForSlot(reservations, "09:00")).toBe(18);
    expect(blockingReservedPeopleForSlot(reservations, "12:00")).toBe(3);
  });
});
