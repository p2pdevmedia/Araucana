import { describe, expect, it } from "vitest";
import { DRIVER_LOCATION_UPDATE_INTERVAL_MS, parseDriverLocationInput } from "./location";

describe("driver location helpers", () => {
  it("keeps the browser reporting cadence at three seconds", () => {
    expect(DRIVER_LOCATION_UPDATE_INTERVAL_MS).toBe(3000);
  });

  it("accepts a valid driver location payload", () => {
    const parsed = parseDriverLocationInput({
      vehicleId: "veh-araucana-24",
      latitude: -40.1579,
      longitude: -71.3534,
      accuracy: 12.5,
      heading: 180,
      speed: 8.4,
      recordedAt: "2026-05-11T14:10:00.000Z"
    });

    expect(parsed).toEqual({
      vehicleId: "veh-araucana-24",
      latitude: -40.1579,
      longitude: -71.3534,
      accuracy: 12.5,
      heading: 180,
      speed: 8.4,
      recordedAt: new Date("2026-05-11T14:10:00.000Z")
    });
  });

  it("rejects coordinates outside real latitude and longitude ranges", () => {
    expect(() =>
      parseDriverLocationInput({
        vehicleId: "veh-araucana-24",
        latitude: -120,
        longitude: -71.3534,
        recordedAt: "2026-05-11T14:10:00.000Z"
      })
    ).toThrow("Ubicacion invalida");

    expect(() =>
      parseDriverLocationInput({
        vehicleId: "veh-araucana-24",
        latitude: -40.1579,
        longitude: -190,
        recordedAt: "2026-05-11T14:10:00.000Z"
      })
    ).toThrow("Ubicacion invalida");
  });
});
