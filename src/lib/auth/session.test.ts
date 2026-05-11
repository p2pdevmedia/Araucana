import { describe, expect, it } from "vitest";
import {
  extractBearerToken,
  getSessionExpirationDate,
  hashSessionToken,
  isSessionExpired,
  toPublicUser
} from "./session";
import { getDefaultPathForRole } from "./roles";

describe("session helpers", () => {
  it("hashes session tokens without returning the raw token", () => {
    const rawToken = "mobile-and-web-token";

    const hashedToken = hashSessionToken(rawToken);

    expect(hashedToken).not.toBe(rawToken);
    expect(hashedToken).toMatch(/^[a-f0-9]{64}$/);
  });

  it("extracts bearer tokens for mobile clients", () => {
    expect(extractBearerToken("Bearer abc123")).toBe("abc123");
    expect(extractBearerToken("bearer abc123")).toBe("abc123");
    expect(extractBearerToken("Token abc123")).toBeNull();
    expect(extractBearerToken(null)).toBeNull();
  });

  it("calculates expiration dates from a day count", () => {
    const now = new Date("2026-05-11T12:00:00.000Z");

    const expiresAt = getSessionExpirationDate(2, now);

    expect(expiresAt.toISOString()).toBe("2026-05-13T12:00:00.000Z");
  });

  it("detects expired sessions", () => {
    const now = new Date("2026-05-11T12:00:00.000Z");

    expect(isSessionExpired(new Date("2026-05-11T11:59:59.000Z"), now)).toBe(true);
    expect(isSessionExpired(new Date("2026-05-11T12:00:01.000Z"), now)).toBe(false);
  });

  it("returns a mobile-safe public user shape", () => {
    const publicUser = toPublicUser({
      id: "user_1",
      email: "kevin@jefe.com",
      name: "Kevin",
      role: "ADMIN",
      isActive: true
    });

    expect(publicUser).toEqual({
      id: "user_1",
      email: "kevin@jefe.com",
      name: "Kevin",
      role: "ADMIN"
    });
  });

  it("preserves operational employee roles in the public user shape", () => {
    expect(
      toPublicUser({
        id: "user_2",
        email: "secretaria@araucana.com",
        name: "Secretaria",
        role: "SECRETARY",
        isActive: true
      }).role
    ).toBe("SECRETARY");

    expect(
      toPublicUser({
        id: "user_3",
        email: "chofer@araucana.com",
        name: "Chofer",
        role: "DRIVER",
        isActive: true
      }).role
    ).toBe("DRIVER");
  });

  it("routes employees to their first allowed workspace after login", () => {
    expect(getDefaultPathForRole("ADMIN")).toBe("/admin");
    expect(getDefaultPathForRole("SECRETARY")).toBe("/admin/reservas");
    expect(getDefaultPathForRole("DRIVER")).toBe("/chofer");
    expect(getDefaultPathForRole("USER")).toBe("/");
  });
});
