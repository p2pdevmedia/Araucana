import type { FlotaEnVivo, NaveEnVivo } from "./en-vivo";

/**
 * Servicios del día cruzados con la unidad asignada.
 *
 * El tablero (`/admin/salidas-del-dia`) dice qué hay que cubrir y permite asignar nave y chofer. Lo que
 * no dice es si esa unidad está viva: si hace media hora que no reporta o si está parada desde las 7.
 * Ese cruce es lo que convierte «está asignada» en «está cubierta».
 *
 * Todo se calcula desde la lista de posiciones que la pantalla ya trae (`FlotaEnVivo`): no hay consulta
 * extra ni tabla nueva.
 */

export type AreaDeServicio = "RUTA" | "AEROPUERTO" | "CHAPELCO" | "ESPECIAL";

export type UnidadDeServicio = {
  vehicleId: string;
  vehicleName: string;
  internalNumber: string | null;
  driverId: string | null;
  driverName: string | null;
};

export type ServicioDelDia = {
  id: string;
  area: AreaDeServicio;
  /** Hora de salida (o primer ascenso); `null` si el servicio no tiene hora cargada. */
  at: Date | null;
  titulo: string;
  detalle: string | null;
  unidades: UnidadDeServicio[];
  pasajeros: number;
  href: string;
};

export type NivelDeServicio = "sin-unidad" | "en-riesgo" | "atencion" | "listo" | "pasado" | "futuro";

export type ServicioEvaluado = ServicioDelDia & {
  nivel: NivelDeServicio;
  /** Texto corto con el motivo, listo para la fila. */
  motivo: string;
  /** Minutos que faltan para la hora del servicio (negativo si ya pasó). */
  minutosParaSalir: number | null;
  /** Estado de cada unidad asignada, para pintar el punto de color. */
  estados: Array<{ vehicleId: string; estado: NaveEnVivo["estado"] | "sin-posicion"; minutos: number | null }>;
};

export type ResumenDeServicios = {
  total: number;
  enRiesgo: number;
  sinUnidad: number;
  listos: number;
  evaluados: ServicioEvaluado[];
};

/** Una unidad que reporta dentro de este rango se considera recién vista. */
const RECIEN_VISTA_MINUTOS = 10;
/** Con menos de esto para salir, una unidad detenida ya es un problema, no una espera. */
export const AVISO_PREVIO_MINUTOS = 90;
/** Si la unidad no se movió en todo este rato antes del servicio, no va a llegar sola. */
const DETENIDA_CRITICA_MINUTOS = 20;

const ORDEN: Record<NivelDeServicio, number> = {
  "sin-unidad": 0,
  "en-riesgo": 1,
  atencion: 2,
  listo: 3,
  futuro: 4,
  pasado: 5
};

function minutosEntre(desde: Date, hasta: Date) {
  return Math.round((hasta.getTime() - desde.getTime()) / 60_000);
}

function buscarNave(flota: FlotaEnVivo | null, vehicleId: string): NaveEnVivo | null {
  if (!flota) return null;
  return flota.naves.find((nave) => nave.vehicleId === vehicleId) ?? null;
}

/**
 * Evalúa un servicio contra la flota. Las reglas, en orden:
 *
 * 1. Sin unidad asignada y el servicio está cerca → riesgo (es el caso que el cliente teme).
 * 2. Unidad sin posición o sin señal → riesgo si falta poco; atención si falta más.
 * 3. Unidad detenida hace rato con el servicio encima → riesgo.
 * 4. Unidad en movimiento → listo.
 *
 * «Cerca» es `AVISO_PREVIO_MINUTOS`; más lejos que eso todavía no es un problema operativo y se marca
 * como futuro para no llenar la pantalla de rojo a las 8 de la mañana.
 */
export function evaluarServicio(
  servicio: ServicioDelDia,
  flota: FlotaEnVivo | null,
  opciones: { ahora?: Date; avisoPrevioMinutos?: number } = {}
): ServicioEvaluado {
  const ahora = opciones.ahora ?? new Date();
  const aviso = opciones.avisoPrevioMinutos ?? AVISO_PREVIO_MINUTOS;
  const minutosParaSalir = servicio.at ? minutosEntre(ahora, servicio.at) : null;
  const cerca = minutosParaSalir != null && minutosParaSalir <= aviso && minutosParaSalir >= -30;
  const yaPaso = minutosParaSalir != null && minutosParaSalir < -30;

  const estados = servicio.unidades.map((unidad) => {
    const nave = buscarNave(flota, unidad.vehicleId);
    if (!nave) return { vehicleId: unidad.vehicleId, estado: "sin-posicion" as const, minutos: null };
    return { vehicleId: unidad.vehicleId, estado: nave.estado, minutos: nave.minutosDesdeLaSenal };
  });

  const base = { ...servicio, minutosParaSalir, estados };

  if (yaPaso) return { ...base, nivel: "pasado", motivo: "servicio ya cumplido" };

  if (servicio.unidades.length === 0) {
    return {
      ...base,
      nivel: cerca ? "sin-unidad" : "futuro",
      motivo: cerca ? "sin nave asignada" : "todavía sin nave"
    };
  }

  const sinPosicion = estados.filter((estado) => estado.estado === "sin-posicion").length;
  const sinSenal = estados.filter((estado) => estado.estado === "sin-senal");
  const detenidas = estados.filter((estado) => estado.estado === "detenida");
  const vivas = estados.filter((estado) => estado.estado === "en-movimiento");

  if (sinPosicion > 0) {
    // Una unidad que nunca reportó importa cuando el servicio se acerca; a las 8 de la mañana por un
    // servicio de las 16 todavía hay tiempo de darla de alta en el seguimiento.
    return {
      ...base,
      nivel: cerca ? "en-riesgo" : "futuro",
      motivo: cerca
        ? `${sinPosicion} unidad${sinPosicion === 1 ? "" : "es"} sin posición`
        : "todavía sin posición"
    };
  }

  if (sinSenal.length > 0) {
    const peor = sinSenal.reduce((max, estado) => Math.max(max, estado.minutos ?? 0), 0);
    return {
      ...base,
      nivel: cerca || peor >= 30 ? "en-riesgo" : "atencion",
      motivo: `sin señal hace ${peor} min`
    };
  }

  if (detenidas.length > 0 && vivas.length === 0) {
    if (cerca) {
      const quieta = detenidas.reduce((max, estado) => Math.max(max, estado.minutos ?? 0), 0);
      return { ...base, nivel: quieta >= DETENIDA_CRITICA_MINUTOS ? "en-riesgo" : "atencion", motivo: "unidad detenida" };
    }
    return { ...base, nivel: "atencion", motivo: "unidad detenida" };
  }

  if (vivas.length > 0) {
    return { ...base, nivel: "listo", motivo: "unidad en movimiento" };
  }

  const recienVistas = estados.filter((estado) => (estado.minutos ?? Infinity) <= RECIEN_VISTA_MINUTOS);
  if (recienVistas.length > 0) return { ...base, nivel: "listo", motivo: "unidad reportando" };

  return { ...base, nivel: cerca ? "atencion" : "futuro", motivo: "sin novedad" };
}

/** Evalúa todo el día y ordena por urgencia: primero lo que hay que resolver y arranca antes. */
export function evaluarServiciosDelDia(
  servicios: ServicioDelDia[],
  flota: FlotaEnVivo | null,
  opciones: { ahora?: Date; avisoPrevioMinutos?: number } = {}
): ResumenDeServicios {
  const evaluados = servicios
    .map((servicio) => evaluarServicio(servicio, flota, opciones))
    .sort((a, b) => {
      const porNivel = ORDEN[a.nivel] - ORDEN[b.nivel];
      if (porNivel !== 0) return porNivel;
      return (a.minutosParaSalir ?? 9_999) - (b.minutosParaSalir ?? 9_999);
    });

  return {
    total: evaluados.length,
    enRiesgo: evaluados.filter((servicio) => servicio.nivel === "en-riesgo" || servicio.nivel === "sin-unidad").length,
    sinUnidad: evaluados.filter((servicio) => servicio.nivel === "sin-unidad").length,
    listos: evaluados.filter((servicio) => servicio.nivel === "listo").length,
    evaluados
  };
}

/** Lo que se muestra arriba del mapa: sólo lo que pide una decisión ahora. */
export function serviciosQuePidenAtencion(resumen: ResumenDeServicios) {
  return resumen.evaluados.filter(
    (servicio) => servicio.nivel === "sin-unidad" || servicio.nivel === "en-riesgo" || servicio.nivel === "atencion"
  );
}
