import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "./password";
import {
  SESSION_COOKIE_NAME,
  extractBearerToken,
  generateSessionToken,
  getSessionExpirationDate,
  hashSessionToken,
  isSessionExpired,
  toPublicUser
} from "./session";

const DEFAULT_SESSION_DAYS = 30;

export type AuthenticatedUser = ReturnType<typeof toPublicUser>;

type SessionWritableClient = {
  session: {
    create(args: {
      data: {
        tokenHash: string;
        userId: string;
        expiresAt: Date;
      };
    }): Promise<unknown>;
  };
};

type SessionUserRecord = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
};

type SessionRefreshClient = SessionWritableClient & {
  session: SessionWritableClient["session"] & {
    findUnique(args: unknown): Promise<({ user: SessionUserRecord } & { expiresAt: Date; id: string }) | null>;
    delete(args: unknown): Promise<unknown>;
  };
};

export class AuthenticationError extends Error {
  constructor(message = "Credenciales invalidas") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function getConfiguredSessionDays() {
  const configuredDays = Number(process.env.SESSION_DAYS ?? DEFAULT_SESSION_DAYS);
  return Number.isFinite(configuredDays) && configuredDays > 0
    ? configuredDays
    : DEFAULT_SESSION_DAYS;
}

export async function createSessionForUser(
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive?: boolean;
  },
  client: SessionWritableClient = prisma,
  now = new Date()
) {
  const token = generateSessionToken();
  const expiresAt = getSessionExpirationDate(getConfiguredSessionDays(), now);

  await client.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId: user.id,
      expiresAt
    }
  });

  return {
    token,
    expiresAt,
    user: toPublicUser(user)
  };
}

export async function createSessionForCredentials(input: {
  email: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !user.isActive) {
    throw new AuthenticationError();
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new AuthenticationError();
  }

  return createSessionForUser(user);
}

export async function getUserFromToken(token: string | null) {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true }
  });

  if (!session || isSessionExpired(session.expiresAt) || !session.user.isActive) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
    }
    return null;
  }

  return toPublicUser(session.user);
}

export async function deleteSessionByToken(token: string | null) {
  if (!token) {
    return;
  }

  await prisma.session
    .delete({
      where: { tokenHash: hashSessionToken(token) }
    })
    .catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return;
      }

      throw error;
    });
}

export async function refreshSessionByToken(token: string | null, client: SessionRefreshClient = prisma as unknown as SessionRefreshClient) {
  if (!token) {
    throw new AuthenticationError("Sesion invalida");
  }

  const tokenHash = hashSessionToken(token);
  const session = await client.session.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!session || isSessionExpired(session.expiresAt) || !session.user.isActive) {
    if (session) {
      await client.session.delete({ where: { id: session.id } }).catch(() => null);
    }
    throw new AuthenticationError("Sesion invalida");
  }

  await client.session.delete({ where: { tokenHash } });
  return createSessionForUser(session.user, client);
}

export function getTokenFromRequest(request: Request) {
  const bearerToken = extractBearerToken(request.headers.get("authorization"));
  if (bearerToken) {
    return bearerToken;
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const sessionCookie = cookies.find((cookie) =>
    cookie.startsWith(`${SESSION_COOKIE_NAME}=`)
  );

  return sessionCookie ? decodeURIComponent(sessionCookie.split("=")[1] ?? "") : null;
}

export async function requireAuthenticatedUser(request: Request) {
  const user = await getUserFromToken(getTokenFromRequest(request));
  if (!user) {
    throw new AuthorizationError();
  }

  return user;
}

export async function requireAdminUser(request: Request) {
  const user = await requireAuthenticatedUser(request);
  if (user.role !== "ADMIN") {
    throw new AuthorizationError("Se requiere un usuario administrador");
  }

  return user;
}

export async function requireReservationsUser(request: Request) {
  const user = await requireAuthenticatedUser(request);
  if (user.role !== "ADMIN" && user.role !== "SECRETARY") {
    throw new AuthorizationError("Se requiere acceso a reservas");
  }

  return user;
}

export async function requireDriverUser(request: Request) {
  const user = await requireAuthenticatedUser(request);
  if (user.role !== "DRIVER") {
    throw new AuthorizationError("Se requiere un usuario chofer");
  }

  return user;
}
