import { NextResponse } from "next/server";
import { approveAdminApiReservationPayment } from "@/lib/admin/api";
import { handleApiError } from "@/lib/api/responses";
import { requireAdminApi } from "../../../_utils";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminApi(request);
    const { code } = await context.params;
    return NextResponse.json({ reservation: await approveAdminApiReservationPayment(code) });
  } catch (error) {
    return handleApiError(error);
  }
}
