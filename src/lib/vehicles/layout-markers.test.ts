import { describe, expect, test } from "vitest";
import { parseLayoutMarkers, toggleLayoutMarker } from "./layout-markers";

describe("vehicle layout markers", () => {
  test("parses door and aisle markers from form json", () => {
    expect(
      parseLayoutMarkers(
        JSON.stringify([
          { type: "DOOR", row: 1, column: 0 },
          { type: "AISLE", row: 2, column: 3 }
        ])
      )
    ).toEqual([
      { type: "DOOR", row: 1, column: 0 },
      { type: "AISLE", row: 2, column: 3 }
    ]);
  });

  test("rejects duplicated markers", () => {
    expect(() =>
      parseLayoutMarkers(
        JSON.stringify([
          { type: "DOOR", row: 1, column: 0 },
          { type: "DOOR", row: 1, column: 0 }
        ])
      )
    ).toThrow("No puede haber marcas repetidas en el plano.");
  });

  test("toggles a door marker on the vehicle edge", () => {
    const marker = { type: "DOOR" as const, row: 1, column: 0 };

    expect(toggleLayoutMarker([], marker)).toEqual([marker]);
    expect(toggleLayoutMarker([marker], marker)).toEqual([]);
  });
});
