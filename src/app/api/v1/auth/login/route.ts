import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionForCredentials } from "@/lib/auth/service";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { handleApiError, jsonError } from "@/lib/api/responses";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.safeParse(await request.json());
    if (!body.success) {
      return jsonError("Email y password son requeridos", 400);
    }

    const session = await createSessionForCredentials(body.data);
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
