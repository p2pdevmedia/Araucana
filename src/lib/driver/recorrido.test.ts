import { describe, expect, it } from "vitest";
import {
  construirRecorridos,
  depurarPuntos,
  distanciaMetros,
  metrosDeRecorrido,
  muestraVencida,
  MAX_PUNTOS_RECORRIDO,
  type MuestraCruda
} from "./recorrido";

/** San Martín de los Andes como origen; los deltas son de metros reales, no inventados a ojo. */
const BASE: [number, number] = [-40.1579, -71.3534];
const GRADO_LAT_M = 111_320;

function muestra(
  driverId: string,
  metrosAlNorte: number,
  minutos: number,
  extra: Partial<MuestraCruda> = {}
): MuestraCruda {
  return {
    driverId,
    vehicleId: extra.vehicleId ?? "veh-08",
    latitude: BASE[0] + metrosAlNorte / GRADO_LAT_M,
    longitude: BASE[1],
    recordedAt: new Date(Date.UTC(2026, 10, 20, 12, minutos)),
    driver: { name: extra.driver?.name ?? "Juan Muñoz" },
    vehicle: { name: "Araucana 08", internalNumber: "AR-08" },
    ...extra
  };
}

describe("distanciaMetros", () => {
  it("mide 0 en el mismo punto y ~111 m por milésima de latitud", () => {
    expect(distanciaMetros(BASE, BASE)).toBe(0);
    const unMilesimo: [number, number] = [BASE[0] + 0.001, BASE[1]];
    expect(distanciaMetros(BASE, unMilesimo)).toBeGreaterThan(105);
    expect(distanciaMetros(BASE, unMilesimo)).toBeLessThan(115);
  });
});

describe("depurarPuntos", () => {
  it("descarta el temblor del GPS quieto y conserva el movimiento real", () => {
    const muestras = [
      muestra("d1", 0, 0),
      muestra("d1", 5, 1), // 5 m: ruido
      muestra("d1", 8, 2), // 3 m más: ruido
      muestra("d1", 200, 3), // 192 m: movimiento
      muestra("d1", 205, 4) // 5 m: ruido
    ];
    const puntos = depurarPuntos(muestras);
    expect(puntos).toHaveLength(2);
    expect(puntos[0].punto[0]).toBeCloseTo(BASE[0], 6);
    expect(puntos[1].punto[0]).toBeGreaterThan(BASE[0]);
  });

  it("ordena por hora aunque la consulta venga desordenada", () => {
    const muestras = [muestra("d1", 300, 3), muestra("d1", 0, 0), muestra("d1", 150, 2)];
    const puntos = depurarPuntos(muestras);
    expect(puntos.map((p) => p.at)).toEqual([...puntos.map((p) => p.at)].sort());
    expect(puntos[0].punto[0]).toBeCloseTo(BASE[0], 6);
  });

  it("recorta a maxPuntos conservando la salida y la llegada", () => {
    const muestras = Array.from({ length: 1000 }, (_, i) => muestra("d1", i * 50, i));
    const puntos = depurarPuntos(muestras, { maxPuntos: 50 });
    expect(puntos).toHaveLength(50);
    expect(puntos[0].punto[0]).toBeCloseTo(BASE[0], 6);
    expect(puntos.at(-1)!.punto[0]).toBeCloseTo(muestras.at(-1)!.latitude, 6);
  });

  it("con menos puntos que el tope no recorta nada", () => {
    const muestras = Array.from({ length: 10 }, (_, i) => muestra("d1", i * 100, i));
    expect(depurarPuntos(muestras, { maxPuntos: MAX_PUNTOS_RECORRIDO })).toHaveLength(10);
  });
});

describe("metrosDeRecorrido", () => {
  it("suma los tramos y redondea", () => {
    const puntos = depurarPuntos([muestra("d1", 0, 0), muestra("d1", 1000, 1), muestra("d1", 2000, 2)]);
    const metros = metrosDeRecorrido(puntos);
    expect(metros).toBeGreaterThan(1900);
    expect(metros).toBeLessThan(2100);
  });

  it("con un solo punto son 0 metros", () => {
    expect(metrosDeRecorrido(depurarPuntos([muestra("d1", 0, 0)]))).toBe(0);
  });
});

describe("construirRecorridos", () => {
  it("agrupa por chofer, no por unidad, y deja la unidad actual en la ficha", () => {
    const muestras = [
      muestra("d1", 0, 0, { vehicleId: "veh-08" }),
      muestra("d1", 400, 5, { vehicleId: "veh-12", vehicle: { name: "Araucana 12", internalNumber: "AR-12" } }),
      muestra("d2", 0, 0, { driver: { name: "María Quiroga" } }),
      muestra("d2", 350, 4, { driver: { name: "María Quiroga" } })
    ];
    const recorridos = construirRecorridos(muestras);
    expect(recorridos).toHaveLength(2);
    const juan = recorridos.find((r) => r.driverId === "d1")!;
    expect(juan.puntos).toHaveLength(2);
    expect(juan.internalNumber).toBe("AR-12");
    expect(juan.vehicleId).toBe("veh-12");
  });

  it("no devuelve recorridos de un solo punto: una unidad quieta no tiene línea que dibujar", () => {
    const recorridos = construirRecorridos([muestra("d1", 0, 0)]);
    expect(recorridos).toEqual([]);
  });

  it("ordena por metros, el que más se movió primero", () => {
    const muestras = [
      muestra("corto", 0, 0),
      muestra("corto", 200, 1),
      muestra("largo", 0, 0),
      muestra("largo", 5000, 10)
    ];
    const recorridos = construirRecorridos(muestras);
    expect(recorridos.map((r) => r.driverId)).toEqual(["largo", "corto"]);
    expect(recorridos[0].metros).toBeGreaterThan(recorridos[1].metros);
  });

  it("deja la última señal y cuántas muestras había", () => {
    const muestras = [muestra("d1", 0, 0), muestra("d1", 300, 7)];
    const [recorrido] = construirRecorridos(muestras);
    expect(recorrido.muestras).toBe(2);
    expect(new Date(recorrido.ultimaSenal).getUTCMinutes()).toBe(7);
  });
});

describe("muestraVencida", () => {
  const ahora = new Date(Date.UTC(2026, 10, 20, 12));
  it("vence pasada la retención y no antes", () => {
    expect(muestraVencida(new Date(Date.UTC(2026, 9, 21, 12)), ahora, 30)).toBe(false); // 30 días justos
    expect(muestraVencida(new Date(Date.UTC(2026, 9, 20, 12)), ahora, 30)).toBe(true); // 31 días
    expect(muestraVencida(new Date(Date.UTC(2026, 10, 19, 12)), ahora, 30)).toBe(false); // ayer
  });
});
