import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password helpers", () => {
  it("verifies the original password against its hash", async () => {
    const password = "kieroMoverElBote";

    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("otraPassword", hash)).resolves.toBe(false);
  });
});
