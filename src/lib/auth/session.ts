import { createHash, randomBytes } from "node:crypto";

export const SESSION_COOKIE_NAME = "araucana_session";

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
};

type UserLike = Omit<PublicUser, "role"> & {
  role: string;
  isActive?: boolean;
};

function toPublicRole(role: string): PublicUser["role"] {
  return role === "ADMIN" ? "ADMIN" : "USER";
}

export function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function extractBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export function getSessionExpirationDate(days: number, now = new Date()) {
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

export function isSessionExpired(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() <= now.getTime();
}

export function toPublicUser(user: UserLike): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: toPublicRole(user.role)
  };
}
