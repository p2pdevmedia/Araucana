import { NextResponse } from "next/server";
import { AuthenticationError, AuthorizationError } from "@/lib/auth/service";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: { message } }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthenticationError) {
    return jsonError(error.message, 401);
  }

  if (error instanceof AuthorizationError) {
    return jsonError(error.message, 403);
  }

  console.error(error);
  return jsonError("Error interno del servidor", 500);
}
