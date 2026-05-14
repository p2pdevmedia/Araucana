import { NextResponse } from "next/server";
import { handleApiError, jsonError } from "@/lib/api/responses";
import { getChapelcoAvailability } from "@/lib/chapelco/repository";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const routeId = url.searchParams.get("routeId")?.trim();
    const date = url.searchParams.get("date")?.trim();

    if (!routeId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return jsonError("VALIDATION_ERROR", "Envia routeId y date en formato YYYY-MM-DD", 400);
    }

    const availability = await getChapelcoAvailability(routeId, date);
    return NextResponse.json(availability);
  } catch (error) {
    return handleApiError(error);
  }
}
