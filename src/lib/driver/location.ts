import { z } from "zod";

export const DRIVER_LOCATION_UPDATE_INTERVAL_MS = 3000;
export const DRIVER_STOP_DISTANCE_THRESHOLD_METERS = 15;
export const DRIVER_STOP_SPEED_THRESHOLD_KMH = 3;

type PreviousLocationPoint = {
  latitude: number;
  longitude: number;
  recordedAt: Date;
  stoppedDurationSeconds?: number | null;
  stopStartedAt?: Date | null;
};

type CurrentLocationPoint = {
  latitude: number;
  longitude: number;
  recordedAt: Date;
  speed?: number | null;
};

const driverLocationSchema = z.object({
  vehicleId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).nullable().optional(),
  heading: z.number().min(0).max(360).nullable().optional(),
  speed: z.number().min(0).nullable().optional(),
  altitude: z.number().nullable().optional(),
  altitudeAccuracy: z.number().min(0).nullable().optional(),
  batteryLevel: z.number().min(0).max(1).nullable().optional(),
  batteryCharging: z.boolean().nullable().optional(),
  clientNetworkType: z.string().max(32).nullable().optional(),
  recordedAt: z.coerce.date()
});

export type DriverLocationInput = z.infer<typeof driverLocationSchema>;

export function parseDriverLocationInput(input: unknown): DriverLocationInput {
  const parsed = driverLocationSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("Ubicacion invalida");
  }

  return {
    ...parsed.data,
    accuracy: parsed.data.accuracy ?? null,
    heading: parsed.data.heading ?? null,
    speed: parsed.data.speed ?? null,
    altitude: parsed.data.altitude ?? null,
    altitudeAccuracy: parsed.data.altitudeAccuracy ?? null,
    batteryLevel: parsed.data.batteryLevel ?? null,
    batteryCharging: parsed.data.batteryCharging ?? null,
    clientNetworkType: parsed.data.clientNetworkType ?? null
  };
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceMeters(
  from: Pick<PreviousLocationPoint, "latitude" | "longitude">,
  to: Pick<CurrentLocationPoint, "latitude" | "longitude">
) {
  const earthRadiusMeters = 6_371_000;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function deriveLocationTelemetry(current: CurrentLocationPoint, previous?: PreviousLocationPoint | null) {
  if (!previous) {
    const reportedSpeedKmh = current.speed == null ? null : current.speed * 3.6;

    return {
      distanceFromPreviousMeters: null,
      secondsFromPrevious: null,
      reportedSpeedKmh,
      inferredSpeedKmh: null,
      isStopped: reportedSpeedKmh != null ? reportedSpeedKmh <= DRIVER_STOP_SPEED_THRESHOLD_KMH : false,
      stoppedDurationSeconds: 0,
      stopStartedAt: null as Date | null
    };
  }

  const distanceFromPreviousMeters = distanceMeters(previous, current);
  const secondsFromPrevious = Math.max(
    0,
    (current.recordedAt.getTime() - previous.recordedAt.getTime()) / 1000
  );
  const reportedSpeedKmh = current.speed == null ? null : current.speed * 3.6;
  const inferredSpeedKmh =
    secondsFromPrevious > 0 ? (distanceFromPreviousMeters / secondsFromPrevious) * 3.6 : null;
  const speedForStop = reportedSpeedKmh ?? inferredSpeedKmh ?? 0;
  const isStopped =
    distanceFromPreviousMeters <= DRIVER_STOP_DISTANCE_THRESHOLD_METERS &&
    speedForStop <= DRIVER_STOP_SPEED_THRESHOLD_KMH;
  const stoppedDurationSeconds = isStopped
    ? (previous.stoppedDurationSeconds ?? 0) + secondsFromPrevious
    : 0;

  return {
    distanceFromPreviousMeters,
    secondsFromPrevious,
    reportedSpeedKmh,
    inferredSpeedKmh,
    isStopped,
    stoppedDurationSeconds,
    stopStartedAt: isStopped ? previous.stopStartedAt ?? previous.recordedAt : null
  };
}
