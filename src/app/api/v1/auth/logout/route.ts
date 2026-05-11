import { NextResponse } from "next/server";
import { deleteSessionByToken, getTokenFromRequest } from "@/lib/auth/service";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/responses";

export async function POST(request: Request) {
  try {
    await deleteSessionByToken(getTokenFromRequest(request));

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/"
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
