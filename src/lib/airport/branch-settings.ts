import { z } from "zod";
import { getSetting, setSetting } from "@/lib/settings/app-settings";
import type { PickupPoint } from "./pickup-zone";

/**
 * Sucursal de la agencia: el punto que el checkout puede precargar con un toque en lugar de
 * buscar la dirección a mano (issue #34, «Mi ubicación / buscar en mapa / o desde sucursal»).
 *
 * La dirección vive en un setting para que la agencia la corrija desde el panel sin deploy; las
 * coordenadas se guardan junto con la dirección porque el checkout no puede geocodificar en el
 * cliente y el punto tiene que estar fijo antes de que el pasajero entre a la página.
 */
export type AirportBranch = {
  label: string;
  address: string;
  point: PickupPoint;
};

const key = "airport.branch";
const point = z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]);

export const airportBranchSchema = z.object({
  label: z.string().trim().min(2, "Poné un nombre corto para la sucursal.").max(60),
  address: z.string().trim().min(5, "Ingresá la dirección de la sucursal.").max(160),
  point
});

/** Oficina de Mariano Moreno 829. Si el panel nunca guardó nada, el botón igual funciona. */
export const DEFAULT_AIRPORT_BRANCH: AirportBranch = {
  label: "Sucursal La Araucana",
  address: "Mariano Moreno 829, San Martín de los Andes",
  point: [-40.1581159, -71.3532838]
};

/** Valor guardado → sucursal. Un setting roto no puede romper el checkout: cae al default. */
export function parseAirportBranch(value: unknown): AirportBranch | null {
  const parsed = airportBranchSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export async function getAirportBranch(db?: Parameters<typeof getSetting>[1]): Promise<AirportBranch> {
  const saved = await getSetting(key, db);
  if (!saved) return DEFAULT_AIRPORT_BRANCH;
  try {
    return parseAirportBranch(JSON.parse(saved)) ?? DEFAULT_AIRPORT_BRANCH;
  } catch {
    return DEFAULT_AIRPORT_BRANCH;
  }
}

export async function saveAirportBranch(branch: AirportBranch, userId: string) {
  await setSetting(key, JSON.stringify(branch), userId);
}
