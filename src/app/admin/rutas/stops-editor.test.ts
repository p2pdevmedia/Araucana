import { describe, expect, it } from "vitest";
import { normalizeStopRows, serializeStopRows } from "./stops-editor";

describe("route stops editor helpers", () => {
  it("normalizes stored stops into editable rows", () => {
    expect(
      normalizeStopRows([
        { name: "SMA", km: 0, minutes: 0, note: "Salida" },
        { name: "Mamuil Malal", km: "110", minutes: "150", note: null },
        { name: "", km: 10, minutes: 20, note: "Sin nombre" },
        "invalid"
      ])
    ).toEqual([
      { name: "SMA", km: "0", minutes: "0", note: "Salida" },
      { name: "Mamuil Malal", km: "110", minutes: "150", note: "" }
    ]);
  });

  it("serializes editable rows for the existing server parser", () => {
    expect(
      serializeStopRows([
        { name: " SMA ", km: "0", minutes: "0", note: " Salida " },
        { name: "Junin", km: "abc", minutes: "45.5", note: "" },
        { name: "", km: "20", minutes: "30", note: "No se guarda" }
      ])
    ).toBe("SMA | 0 | 0 | Salida\nJunin | 0 | 45.5 | ");
  });
});
