import { buildFleetWorkbook, exportFileName } from "@/lib/vehicles/fleet-export";
import { recordDownload } from "@/lib/audit/download";
import { AuthorizationError, requireAdminUser } from "@/lib/auth/service";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Planilla de flota en Excel: la misma data del tablero, para trabajar fuera de la app. Sólo ADMIN. */
export async function GET(request: Request) {
  let downloader;
  try {
    downloader = await requireAdminUser(request);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return new Response("No autorizado", { status: 401 });
    }
    throw error;
  }

  const flota = await prisma.vehicle.findMany({
    include: { _count: { select: { seats: true } } },
    orderBy: [{ isActive: "desc" }, { internalNumber: "asc" }, { name: "asc" }]
  });
  const generatedAt = new Date();
  const workbook = await buildFleetWorkbook(
    flota.map((nave) => ({ ...nave, asientos: nave._count.seats })),
    { generatedAt }
  );

  await recordDownload(request, downloader, {
    entity: "VEHICLE",
    entityLabel: "Planilla de flota",
    summary: "Planilla de flota descargada en Excel."
  });

  return new Response(new Uint8Array(workbook), {
    headers: {
      "Content-Type": XLSX_TYPE,
      "Content-Disposition": `attachment; filename="${exportFileName(generatedAt)}"`,
      "Content-Length": String(workbook.byteLength),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
