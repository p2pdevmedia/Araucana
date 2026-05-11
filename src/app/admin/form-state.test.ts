import { describe, expect, test } from "vitest";
import { z } from "zod";
import { errorState, fieldErrorsFromZodError, successState } from "./form-state";

describe("admin form state helpers", () => {
  test("keeps the first inline validation message for each field", () => {
    const schema = z.object({
      email: z.string().min(1, "Ingresa el email.").email("El email no es valido."),
      name: z.string().min(2, "Ingresa al menos 2 caracteres.")
    });

    const parsed = schema.safeParse({ email: "", name: "" });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(fieldErrorsFromZodError(parsed.error)).toEqual({
        email: "Ingresa el email.",
        name: "Ingresa al menos 2 caracteres."
      });
    }
  });

  test("creates consistent success and error states", () => {
    expect(successState("Guardado con exito.")).toEqual({
      status: "success",
      message: "Guardado con exito.",
      fieldErrors: {}
    });

    expect(errorState("Revisa los campos.", { name: "Falta el nombre." })).toEqual({
      status: "error",
      message: "Revisa los campos.",
      fieldErrors: {
        name: "Falta el nombre."
      }
    });
  });
});
