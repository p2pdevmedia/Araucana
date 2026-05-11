import { describe, expect, test } from "vitest";
import { VEHICLE_TEMPLATES, getVehicleTemplate, normalizeSeats } from "./templates";

describe("vehicle templates", () => {
  test("includes editable templates for common minibus brands", () => {
    expect(VEHICLE_TEMPLATES.map((template) => template.brand)).toEqual(
      expect.arrayContaining(["Mercedes-Benz", "Fiat", "Iveco", "Toyota", "Renault", "Hyundai"])
    );
  });

  test("loads the Mercedes Sprinter 19 passenger layout", () => {
    const template = getVehicleTemplate("mercedes-sprinter-19");

    expect(template?.capacity).toBe(19);
    expect(template?.seats).toHaveLength(19);
    expect(template?.seats[0]).toEqual({ number: "01", row: 1, column: 1 });
  });

  test("normalizes seats by trimming numbers and sorting by position", () => {
    expect(
      normalizeSeats([
        { number: " 02 ", row: 2, column: 1 },
        { number: "01", row: 1, column: 1 }
      ])
    ).toEqual([
      { number: "01", row: 1, column: 1 },
      { number: "02", row: 2, column: 1 }
    ]);
  });
});
