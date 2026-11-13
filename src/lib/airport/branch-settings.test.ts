import { describe, expect, it } from "vitest";
import { DEFAULT_AIRPORT_BRANCH, airportBranchSchema, parseAirportBranch } from "./branch-settings";
import { airportPickupZoneOf, initialAirportCoverage } from "./pickup-zone";

describe("sucursal del checkout", () => {
  it("la sucursal por defecto cae en la zona sin recargo", () => {
    // Si la oficina quedara en el perímetro con recargo (o afuera), el atajo cobraría un extra
    // o directamente no dejaría reservar. Es el chequeo que evita ese bug silencioso.
    expect(airportPickupZoneOf(DEFAULT_AIRPORT_BRANCH.point, initialAirportCoverage)).toBe("BASE");
  });

  it("la sucursal por defecto tiene los datos que ve el pasajero", () => {
    expect(DEFAULT_AIRPORT_BRANCH.label.length).toBeGreaterThan(2);
    expect(DEFAULT_AIRPORT_BRANCH.address).toContain("Mariano Moreno 829");
    expect(airportBranchSchema.safeParse(DEFAULT_AIRPORT_BRANCH).success).toBe(true);
  });

  it("acepta una sucursal guardada por el panel", () => {
    const guardada = { label: "Oficina", address: "San Martín 123, San Martín de los Andes", point: [-40.15, -71.35] };
    expect(parseAirportBranch(guardada)).toEqual(guardada);
  });

  it("recorta espacios sobrantes al leer el setting", () => {
    const conEspacios = { label: "  Oficina  ", address: "  San Martín 123  ", point: [-40.15, -71.35] };
    expect(parseAirportBranch(conEspacios)).toEqual({ label: "Oficina", address: "San Martín 123", point: [-40.15, -71.35] });
  });

  it("descarta una sucursal incompleta o con coordenadas imposibles", () => {
    expect(parseAirportBranch(null)).toBeNull();
    expect(parseAirportBranch({})).toBeNull();
    expect(parseAirportBranch({ label: "Oficina", address: "", point: [-40.15, -71.35] })).toBeNull();
    expect(parseAirportBranch({ label: "Oficina", address: "San Martín 123" })).toBeNull();
    expect(parseAirportBranch({ label: "Oficina", address: "San Martín 123", point: [-140, -71.35] })).toBeNull();
  });
});
