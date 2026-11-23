import { describe, expect, it } from "vitest";
import { COLUMNAS_PLANILLA, filaDeNave, filasDeFlota, type NaveParaPlanilla } from "./fleet-export";

const hoy = new Date("2026-11-22T12:00:00-03:00");

function nave(extra: Partial<NaveParaPlanilla> = {}): NaveParaPlanilla {
  return {
    internalNumber: "1910", name: "Araucana 10", brand: "Mercedes", model: "Sprinter", kind: "BUS",
    licensePlate: "AF123BC", year: 2019, owner: "LA ARAUCANA VIAJES SRL", insurer: "Prot Mut",
    publicTransport: true, isActive: true, notes: null,
    technicalInspectionDueAt: null, rtoDueAt: null, policyDueAt: null, asientos: 19,
    ...extra
  };
}

describe("planilla de flota", () => {
  it("arma una fila con antigüedad, papeles y estado", () => {
    const fila = filaDeNave(nave({ policyDueAt: new Date("2026-12-12T03:00:00Z") }), hoy);
    expect(fila).toHaveLength(COLUMNAS_PLANILLA.length);
    expect(fila[0]).toBe("1910");
    expect(fila[6]).toBe("7 años");
    expect(fila[9]).toBe("12/12/2026 · Vence en 20 días");
    expect(fila[10]).toBe("Sin dato");
    expect(fila[13]).toBe("Sí");
    expect(fila[14]).toBe("Habilitada");
  });

  it("marca la unidad no habilitada y la que no tiene datos", () => {
    const fila = filaDeNave(nave({ isActive: false, year: null, internalNumber: null, owner: null, insurer: null, publicTransport: false, licensePlate: null }), hoy);
    expect(fila[0]).toBe("—");
    expect(fila[6]).toBe("—");
    expect(fila[9]).toBe("Sin dato");
    expect(fila[13]).toBe("No");
    expect(fila[14]).toBe("No habilitada");
  });

  it("una antigüedad de un año no pluraliza", () => {
    expect(filaDeNave(nave({ year: 2025 }), hoy)[6]).toBe("1 año");
  });

  it("devuelve una fila por unidad", () => {
    expect(filasDeFlota([nave(), nave({ name: "Otra" })], hoy)).toHaveLength(2);
  });
});
