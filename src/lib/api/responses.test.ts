import { describe, expect, it } from "vitest";
import { jsonError } from "./responses";

describe("api responses", () => {
  it("returns structured machine-readable errors", async () => {
    const response = jsonError("VALIDATION_ERROR", "Revisa los campos.", 422, {
      email: "El email no es valido."
    });

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Revisa los campos.",
        fields: {
          email: "El email no es valido."
        }
      }
    });
  });
});
