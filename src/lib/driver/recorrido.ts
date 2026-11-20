import { prisma } from "@/lib/db/prisma";

/**
 * Recorrido dibujado y seguimiento por chofer (issue #321): el historial de posiciones ya se escribe
 * (`DriverLocationSample`, una fila por reporte del panel del chofer cada 3 s) y hasta ahora no lo leía
 * nadie. Esta capa arma la línea que se dibuja en el mapa y la ficha por chofer.
 *
 * Igual que `en-vivo.ts`: una mitad pura (testeable sin base) y una mitad de consulta.
 *
 * Dos cuidados que no son de estética:
 *  - la lectura va **acotada a una ventana** (`VENTANA_RECORRIDO_HORAS`): sin eso, a 3 s por reporte la
 *    consulta crece sin techo (≈1.200 filas por hora por chofer);
 *  - los puntos a menos de `DISTANCIA_MINIMA_METROS` se descartan: un GPS quieto tirita y dibujaría
 *    una maraña de 2 m en la puerta de la terminal.
 */

/** Hasta cuántas horas atrás se dibuja el recorrido. Coincide con la jornada larga de un chofer. */
export const VENTANA_RECORRIDO_HORAS = 8;

/** Tope de puntos por recorrido: por encima de esto la línea no se lee mejor, sólo pesa más. */
export const MAX_PUNTOS_RECORRIDO = 400;

/** Debajo de esta distancia el punto es ruido del GPS y no un movimiento real. */
export const DISTANCIA_MINIMA_METROS = 25;

/** Cuántos días se guarda el historial de posiciones antes de poder borrarlo. */
export const RETENCION_DIAS = 30;

export type MuestraCruda = {
  driverId: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  recordedAt: Date;
  driver: { name: string | null };
  vehicle: { name: string; internalNumber: string | null };
};

export type PuntoRecorrido = {
  /** [lat, lng], como los quiere Leaflet. */
  punto: [number, number];
  /** ISO del reporte que originó el punto. */
  at: string;
};

export type Recorrido = {
  driverId: string;
  driverName: string | null;
  vehicleId: string;
  internalNumber: string | null;
  vehicleName: string;
  puntos: PuntoRecorrido[];
  /** Metros acumulados sobre los puntos dibujados (no sobre todas las muestras). */
  metros: number;
  ultimaSenal: string;
  /** Cuántas muestras crudas había antes de descartar ruido y recortar. */
  muestras: number;
};

export type OpcionesRecorrido = {
  maxPuntos?: number;
  distanciaMinimaMetros?: number;
};

const RADIO_TIERRA_M = 6_371_000;

/** Distancia entre dos coordenadas, en metros (haversine). */
export function distanciaMetros(a: [number, number], b: [number, number]): number {
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Deja los puntos que valen la pena dibujar: ordena por hora, descarta lo que está a menos de
 * `distanciaMinimaMetros` del punto anterior y, si todavía son muchos, los reparte parejo hasta
 * `maxPuntos` **conservando el primero y el último** (la salida y la llegada son lo que se mira).
 */
export function depurarPuntos(
  muestras: MuestraCruda[],
  { maxPuntos = MAX_PUNTOS_RECORRIDO, distanciaMinimaMetros = DISTANCIA_MINIMA_METROS }: OpcionesRecorrido = {}
): PuntoRecorrido[] {
  const ordenadas = [...muestras].sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
  const filtrados: PuntoRecorrido[] = [];

  for (const muestra of ordenadas) {
    const punto: [number, number] = [muestra.latitude, muestra.longitude];
    const anterior = filtrados.at(-1);
    if (anterior && distanciaMetros(anterior.punto, punto) < distanciaMinimaMetros) continue;
    filtrados.push({ punto, at: muestra.recordedAt.toISOString() });
  }

  if (filtrados.length <= maxPuntos) return filtrados;

  const paso = (filtrados.length - 1) / (maxPuntos - 1);
  const recortados: PuntoRecorrido[] = [];
  for (let i = 0; i < maxPuntos; i += 1) {
    recortados.push(filtrados[Math.round(i * paso)]);
  }
  return recortados;
}

/** Metros recorridos sumando los puntos ya depurados. */
export function metrosDeRecorrido(puntos: PuntoRecorrido[]): number {
  let total = 0;
  for (let i = 1; i < puntos.length; i += 1) {
    total += distanciaMetros(puntos[i - 1].punto, puntos[i].punto);
  }
  return Math.round(total);
}

/**
 * Un recorrido por chofer. Se agrupa por `driverId` (no por unidad): el mismo chofer puede cambiar de
 * nave en el día y lo que se sigue es la persona; la unidad queda como dato de la ficha.
 */
export function construirRecorridos(
  muestras: MuestraCruda[],
  opciones: OpcionesRecorrido = {}
): Recorrido[] {
  const porChofer = new Map<string, MuestraCruda[]>();
  for (const muestra of muestras) {
    const lista = porChofer.get(muestra.driverId);
    if (lista) lista.push(muestra);
    else porChofer.set(muestra.driverId, [muestra]);
  }

  const recorridos: Recorrido[] = [];
  for (const [driverId, lista] of porChofer) {
    const puntos = depurarPuntos(lista, opciones);
    if (puntos.length < 2) continue;
    // La unidad de la ficha es la del último reporte: si cambió de nave, la que importa es la actual.
    const ultima = [...lista].sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())[0];
    recorridos.push({
      driverId,
      driverName: ultima.driver.name?.trim() || null,
      vehicleId: ultima.vehicleId,
      internalNumber: ultima.vehicle.internalNumber,
      vehicleName: ultima.vehicle.name,
      puntos,
      metros: metrosDeRecorrido(puntos),
      ultimaSenal: ultima.recordedAt.toISOString(),
      muestras: lista.length
    });
  }

  return recorridos.sort((a, b) => b.metros - a.metros);
}

/** Corte de retención: la muestra ya se puede borrar. Puro, para poder testearlo. */
export function muestraVencida(
  recordedAt: Date,
  ahora: Date = new Date(),
  dias: number = RETENCION_DIAS
): boolean {
  return ahora.getTime() - recordedAt.getTime() > dias * 24 * 60 * 60 * 1000;
}

const SELECT_MUESTRA = {
  driverId: true,
  vehicleId: true,
  latitude: true,
  longitude: true,
  recordedAt: true,
  driver: { select: { name: true } },
  vehicle: { select: { name: true, internalNumber: true } }
} as const;

/**
 * Recorridos de la ventana pedida. `horas` se acota entre 1 y la ventana larga: la pantalla nunca debe
 * poder pedir «todo el historial» por querystring.
 */
export async function cargarRecorridos(
  horas: number = VENTANA_RECORRIDO_HORAS,
  ahora: Date = new Date()
): Promise<Recorrido[]> {
  const acotadas = Math.min(Math.max(Math.round(horas), 1), VENTANA_RECORRIDO_HORAS);
  const desde = new Date(ahora.getTime() - acotadas * 60 * 60 * 1000);
  const muestras = await prisma.driverLocationSample.findMany({
    where: { recordedAt: { gte: desde } },
    select: SELECT_MUESTRA,
    orderBy: { recordedAt: "asc" }
  });
  return construirRecorridos(muestras);
}

/**
 * Borra las muestras más viejas que la retención. Devuelve cuántas se borraron.
 * Lo llama `scripts/limpiar-posiciones.mjs`; no corre solo porque el proyecto no tiene scheduler.
 */
export async function limpiarMuestrasVencidas(
  ahora: Date = new Date(),
  dias: number = RETENCION_DIAS
): Promise<number> {
  const corte = new Date(ahora.getTime() - dias * 24 * 60 * 60 * 1000);
  const { count } = await prisma.driverLocationSample.deleteMany({
    where: { recordedAt: { lt: corte } }
  });
  return count;
}
