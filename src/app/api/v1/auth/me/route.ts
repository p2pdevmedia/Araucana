import { NextResponse } from "next/server";
import { getTokenFromRequest, getUserFromToken } from "@/lib/auth/service";

export async function GET(request: Request) {
  const user = await getUserFromToken(getTokenFromRequest(request));

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
