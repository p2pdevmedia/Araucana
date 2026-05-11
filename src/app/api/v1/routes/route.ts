import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/responses";
import { listPublicRoutes } from "@/lib/booking/repository";

export async function GET() {
  try {
    const routes = await listPublicRoutes();

    return NextResponse.json({ routes });
  } catch (error) {
    return handleApiError(error);
  }
}
