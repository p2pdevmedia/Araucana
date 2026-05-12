import { describe, expect, it } from "vitest";
import { parseMonthlySalaryCents } from "./salary";

describe("admin salary parsing", () => {
  it("stores salaries as cents", () => {
    expect(parseMonthlySalaryCents("125000")).toBe(12_500_000);
    expect(parseMonthlySalaryCents("125.000,50")).toBe(12_500_050);
  });

  it("allows empty salaries", () => {
    expect(parseMonthlySalaryCents("")).toBeNull();
    expect(parseMonthlySalaryCents("   ")).toBeNull();
  });

  it("rejects invalid salaries", () => {
    expect(() => parseMonthlySalaryCents("0")).toThrow("El sueldo debe ser mayor a cero.");
    expect(() => parseMonthlySalaryCents("abc")).toThrow("El sueldo debe ser mayor a cero.");
  });
});
