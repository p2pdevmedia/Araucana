import { NextResponse } from "next/server";
import { handleApiError, jsonError } from "@/lib/api/responses";
import { getReservationByCode } from "@/lib/booking/repository";

type RouteParams = {
  params: Promise<{ code: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    const reservation = await getReservationByCode(code.toUpperCase());

    if (!reservation) {
      return jsonError("Reserva no encontrada", 404);
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    return handleApiError(error);
  }
}
