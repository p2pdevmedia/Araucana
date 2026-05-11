import { NextResponse } from "next/server";
import { getOpenApiSpec } from "@/lib/api/openapi";

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  return NextResponse.json(getOpenApiSpec(baseUrl));
}
