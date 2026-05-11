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

  it("ignores accidental surrounding whitespace when verifying passwords", async () => {
    const hash = await hashPassword("kieroMoverElBote");

    await expect(verifyPassword(" kieroMoverElBote ", hash)).resolves.toBe(true);
  });
});
