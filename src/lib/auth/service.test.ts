import { describe, expect, it, vi } from "vitest";
import { createSessionForUser } from "./service";

describe("auth service mobile sessions", () => {
  it("creates a token response with an explicit expiration for native apps", async () => {
    const sessionCreate = vi.fn().mockResolvedValue({});
    const result = await createSessionForUser(
      {
        id: "user-1",
        email: "admin@example.com",
        name: "Admin",
        role: "ADMIN",
        isActive: true
      },
      {
        session: {
          create: sessionCreate
        }
      },
      new Date("2026-05-11T12:00:00.000Z")
    );

    expect(result.token).toEqual(expect.any(String));
    expect(result.expiresAt.toISOString()).toBe("2026-06-10T12:00:00.000Z");
    expect(result.user).toEqual({
      id: "user-1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN"
    });
    expect(sessionCreate).toHaveBeenCalledWith({
      data: {
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        userId: "user-1",
        expiresAt: new Date("2026-06-10T12:00:00.000Z")
      }
    });
  });
});
