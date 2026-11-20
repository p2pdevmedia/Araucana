import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/responses";
import { cargarRecorridos, VENTANA_RECORRIDO_HORAS } from "@/lib/driver/recorrido";
import { requireAdminApi } from "../_utils";

/**
 * Recorridos dibujados (issue #321). Sólo lectura del historial que escribe el panel del chofer.
 * `?horas=` se acota en `cargarRecorridos`: la pantalla no puede pedir el historial completo.
 */
export async function GET(request: Request) {
  try {
    await requireAdminApi(request);
    const pedidas = Number(new URL(request.url).searchParams.get("horas") ?? VENTANA_RECORRIDO_HORAS);
    const horas = Number.isFinite(pedidas) ? pedidas : VENTANA_RECORRIDO_HORAS;
    return NextResponse.json({ recorridos: await cargarRecorridos(horas), horas });
  } catch (error) {
    return handleApiError(error);
  }
}
