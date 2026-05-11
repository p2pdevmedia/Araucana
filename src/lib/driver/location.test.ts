import { describe, expect, it } from "vitest";
import {
  DRIVER_LOCATION_UPDATE_INTERVAL_MS,
  deriveLocationTelemetry,
  parseDriverLocationInput
} from "./location";

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
      altitude: 720.5,
      altitudeAccuracy: 4.2,
      batteryLevel: 0.76,
      batteryCharging: true,
      clientNetworkType: "4g",
      recordedAt: "2026-05-11T14:10:00.000Z"
    });

    expect(parsed).toEqual({
      vehicleId: "veh-araucana-24",
      latitude: -40.1579,
      longitude: -71.3534,
      accuracy: 12.5,
      heading: 180,
      speed: 8.4,
      altitude: 720.5,
      altitudeAccuracy: 4.2,
      batteryLevel: 0.76,
      batteryCharging: true,
      clientNetworkType: "4g",
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

  it("derives operational telemetry from consecutive GPS points", () => {
    const telemetry = deriveLocationTelemetry(
      {
        latitude: -40.1579,
        longitude: -71.3534,
        recordedAt: new Date("2026-05-11T14:10:03.000Z"),
        speed: 11.4
      },
      {
        latitude: -40.1578,
        longitude: -71.3535,
        recordedAt: new Date("2026-05-11T14:10:00.000Z"),
        stoppedDurationSeconds: 0,
        stopStartedAt: null
      }
    );

    expect(telemetry.secondsFromPrevious).toBe(3);
    expect(telemetry.distanceFromPreviousMeters).toBeGreaterThan(0);
    expect(telemetry.reportedSpeedKmh).toBeCloseTo(41.04, 2);
    expect(telemetry.isStopped).toBe(false);
    expect(telemetry.stopStartedAt).toBeNull();
  });

  it("keeps accumulating stopped time while points stay within the stop threshold", () => {
    const telemetry = deriveLocationTelemetry(
      {
        latitude: -40.1579001,
        longitude: -71.3534001,
        recordedAt: new Date("2026-05-11T14:10:06.000Z"),
        speed: 0
      },
      {
        latitude: -40.1579,
        longitude: -71.3534,
        recordedAt: new Date("2026-05-11T14:10:00.000Z"),
        stoppedDurationSeconds: 12,
        stopStartedAt: new Date("2026-05-11T14:09:48.000Z")
      }
    );

    expect(telemetry.isStopped).toBe(true);
    expect(telemetry.stoppedDurationSeconds).toBe(18);
    expect(telemetry.stopStartedAt).toEqual(new Date("2026-05-11T14:09:48.000Z"));
  });
});
