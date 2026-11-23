import ExcelJS from "exceljs";
import { complianceLabel, formatoFecha, vencimientosDe } from "./compliance";

/**
 * Planilla de flota en Excel (#369, «fácil acceso a la data»).
 *
 * Es la planilla que el cliente ya mantiene a mano: una fila por unidad con antigüedad, papeles y
 * estado. Se arma desde los mismos datos que el tablero, así lo que se descarga y lo que se ve en
 * pantalla no pueden discrepar.
 */

export type NaveParaPlanilla = {
  internalNumber: string | null;
  name: string;
  brand: string;
  model: string;
  kind: string;
  licensePlate: string | null;
  year: number | null;
  owner: string | null;
  insurer: string | null;
  publicTransport: boolean;
  isActive: boolean;
  notes: string | null;
  technicalInspectionDueAt: Date | null;
  rtoDueAt: Date | null;
  policyDueAt: Date | null;
  asientos: number;
};

export const COLUMNAS_PLANILLA = [
  "Interno", "Nombre", "Tipo", "Marca / modelo", "Patente", "Año", "Antigüedad", "Titular",
  "Seguro", "Póliza", "Técnica", "RTO", "Pasajeros", "Transporte público", "Estado", "Notas"
] as const;

/** El papel con su fecha y cuánto falta, en la misma celda: «12/03/2027 · Vence en 20 días». */
function papel(fecha: Date | null, hoy: Date) {
  return fecha ? `${formatoFecha(fecha)} · ${complianceLabel(fecha, hoy)}` : "Sin dato";
}

export function filaDeNave(nave: NaveParaPlanilla, hoy: Date = new Date()): string[] {
  const vencimientos = Object.fromEntries(vencimientosDe(nave, hoy).map((v) => [v.tipo, v.fecha]));
  const antiguedad = nave.year ? Math.max(hoy.getFullYear() - nave.year, 0) : null;
  return [
    nave.internalNumber?.trim() || "—",
    nave.name,
    nave.kind,
    [nave.brand, nave.model].filter(Boolean).join(" "),
    nave.licensePlate ?? "—",
    nave.year ? String(nave.year) : "—",
    antiguedad != null ? `${antiguedad} año${antiguedad === 1 ? "" : "s"}` : "—",
    nave.owner?.trim() || "—",
    nave.insurer?.trim() || "—",
    papel(vencimientos.Póliza ?? nave.policyDueAt, hoy),
    papel(vencimientos.Técnica ?? nave.technicalInspectionDueAt, hoy),
    papel(vencimientos.RTO ?? nave.rtoDueAt, hoy),
    String(nave.asientos),
    nave.publicTransport ? "Sí" : "No",
    nave.isActive ? "Habilitada" : "No habilitada",
    nave.notes?.trim() || ""
  ];
}

export function filasDeFlota(naves: readonly NaveParaPlanilla[], hoy: Date = new Date()): string[][] {
  return naves.map((nave) => filaDeNave(nave, hoy));
}

const ANCHO: Record<(typeof COLUMNAS_PLANILLA)[number], number> = {
  "Interno": 10, "Nombre": 18, "Tipo": 13, "Marca / modelo": 24, "Patente": 11, "Año": 7,
  "Antigüedad": 11, "Titular": 22, "Seguro": 16, "Póliza": 30, "Técnica": 30, "RTO": 30,
  "Pasajeros": 10, "Transporte público": 18, "Estado": 15, "Notas": 40
};

export async function buildFleetWorkbook(naves: readonly NaveParaPlanilla[], meta: { generatedAt: Date }): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "La Araucana Viajes";
  const hoja = workbook.addWorksheet("Flota", { views: [{ state: "frozen", ySplit: 1 }] });
  hoja.columns = COLUMNAS_PLANILLA.map((titulo) => ({ header: titulo, key: titulo, width: ANCHO[titulo] }));
  hoja.getRow(1).font = { bold: true };
  hoja.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7DFCB" } };
  for (const fila of filasDeFlota(naves, meta.generatedAt)) {
    const row = hoja.addRow(fila);
    if (fila[COLUMNAS_PLANILLA.indexOf("Estado")] === "No habilitada") row.font = { color: { argb: "FF8A3B2E" } };
  }
  hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNAS_PLANILLA.length } };
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function exportFileName(generatedAt: Date): string {
  return `flota-${generatedAt.toISOString().slice(0, 10)}.xlsx`;
}
