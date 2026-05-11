import { NextResponse } from "next/server";
import { listAdminApiReservations } from "@/lib/admin/api";
import { handleApiError } from "@/lib/api/responses";
import { requireAdminApi } from "../_utils";

export async function GET(request: Request) {
  try {
    await requireAdminApi(request);
    return NextResponse.json({ reservations: await listAdminApiReservations() });
  } catch (error) {
    return handleApiError(error);
  }
}
