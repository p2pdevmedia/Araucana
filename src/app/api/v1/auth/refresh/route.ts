import { NextResponse } from "next/server";
import { getTokenFromRequest, refreshSessionByToken } from "@/lib/auth/service";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/responses";

export async function POST(request: Request) {
  try {
    const session = await refreshSessionByToken(getTokenFromRequest(request));
    const response = NextResponse.json({
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      user: session.user
    });

    response.cookies.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/"
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
