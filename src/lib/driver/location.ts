import { z } from "zod";

export const DRIVER_LOCATION_UPDATE_INTERVAL_MS = 3000;

const driverLocationSchema = z.object({
  vehicleId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).nullable().optional(),
  heading: z.number().min(0).max(360).nullable().optional(),
  speed: z.number().min(0).nullable().optional(),
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
    speed: parsed.data.speed ?? null
  };
}
