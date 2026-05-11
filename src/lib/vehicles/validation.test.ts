import { describe, expect, test } from "vitest";
import { parseSeatLayout } from "./validation";

describe("parseSeatLayout", () => {
  test("accepts a valid editable seat layout", () => {
    expect(parseSeatLayout(JSON.stringify([{ number: "01", row: 1, column: 1 }]))).toEqual([
      { number: "01", row: 1, column: 1 }
    ]);
  });

  test("rejects duplicate seat numbers", () => {
    expect(() =>
      parseSeatLayout(
        JSON.stringify([
          { number: "01", row: 1, column: 1 },
          { number: "01", row: 1, column: 2 }
        ])
      )
    ).toThrow("No puede haber asientos repetidos.");
  });

  test("rejects empty layouts", () => {
    expect(() => parseSeatLayout("[]")).toThrow("La nave necesita al menos un asiento.");
  });
});
