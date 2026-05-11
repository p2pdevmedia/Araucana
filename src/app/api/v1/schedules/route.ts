import { NextResponse } from "next/server";
import { handleApiError, jsonError } from "@/lib/api/responses";
import { getSeatMap, listSchedulesForRoute } from "@/lib/booking/repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get("routeId");

    if (!routeId) {
      return jsonError("VALIDATION_ERROR", "routeId es requerido", 400, {
        routeId: "routeId es requerido"
      });
    }

    const schedules = await listSchedulesForRoute(routeId);
    const schedulesWithSeatMaps = await Promise.all(
      schedules.map(async (schedule) => ({
        ...schedule,
        seatMap: await getSeatMap(schedule.id)
      }))
    );

    return NextResponse.json({ schedules: schedulesWithSeatMaps });
  } catch (error) {
    return handleApiError(error);
  }
}
