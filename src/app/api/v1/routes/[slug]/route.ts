import { NextResponse } from "next/server";
import { handleApiError, jsonError } from "@/lib/api/responses";
import { getPublicRouteBySlug } from "@/lib/booking/repository";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const route = await getPublicRouteBySlug(slug);

    if (!route) {
      return jsonError("ROUTE_NOT_FOUND", "Ruta no encontrada", 404);
    }

    return NextResponse.json({ route });
  } catch (error) {
    return handleApiError(error);
  }
}
