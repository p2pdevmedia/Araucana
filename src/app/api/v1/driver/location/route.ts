import { NextResponse } from "next/server";
import { AuthorizationError, requireDriverUser } from "@/lib/auth/service";
import { prisma } from "@/lib/db/prisma";
import { deriveLocationTelemetry, parseDriverLocationInput } from "@/lib/driver/location";
import { handleApiError, jsonError } from "@/lib/api/responses";

export async function POST(request: Request) {
  try {
    const user = await requireDriverUser(request);
    const location = parseDriverLocationInput(await request.json());
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: location.vehicleId,
        isActive: true
      },
      select: {
        id: true,
        name: true
      }
    });

    if (!vehicle) {
      return jsonError("VEHICLE_NOT_FOUND", "La nave seleccionada no esta activa", 404);
    }

    const savedLocation = await prisma.$transaction(async (tx) => {
      const previousLocation = await tx.driverVehicleLocation.findUnique({
        where: {
          driverId: user.id
        },
        select: {
          latitude: true,
          longitude: true,
          recordedAt: true,
          stoppedDurationSeconds: true,
          stopStartedAt: true
        }
      });
      const telemetry = deriveLocationTelemetry(location, previousLocation);
      const locationData = {
        ...location,
        ...telemetry
      };

      await tx.driverLocationSample.create({
        data: {
          ...locationData,
          driverId: user.id
        }
      });

      return tx.driverVehicleLocation.upsert({
        where: {
          driverId: user.id
        },
        update: locationData,
        create: {
          ...locationData,
          driverId: user.id
        },
        include: {
          vehicle: {
            select: {
              name: true
            }
          }
        }
      });
    });

    return NextResponse.json({
      location: {
        vehicleId: savedLocation.vehicleId,
        vehicleName: savedLocation.vehicle.name,
        latitude: savedLocation.latitude,
        longitude: savedLocation.longitude,
        accuracy: savedLocation.accuracy,
        heading: savedLocation.heading,
        speed: savedLocation.speed,
        altitude: savedLocation.altitude,
        altitudeAccuracy: savedLocation.altitudeAccuracy,
        batteryLevel: savedLocation.batteryLevel,
        batteryCharging: savedLocation.batteryCharging,
        clientNetworkType: savedLocation.clientNetworkType,
        distanceFromPreviousMeters: savedLocation.distanceFromPreviousMeters,
        secondsFromPrevious: savedLocation.secondsFromPrevious,
        reportedSpeedKmh: savedLocation.reportedSpeedKmh,
        inferredSpeedKmh: savedLocation.inferredSpeedKmh,
        isStopped: savedLocation.isStopped,
        stoppedDurationSeconds: savedLocation.stoppedDurationSeconds,
        stopStartedAt: savedLocation.stopStartedAt?.toISOString() ?? null,
        recordedAt: savedLocation.recordedAt.toISOString(),
        updatedAt: savedLocation.updatedAt.toISOString()
      }
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError("UNAUTHORIZED", error.message, 401);
    }

    if (error instanceof Error && error.message === "Ubicacion invalida") {
      return jsonError("VALIDATION_ERROR", error.message, 400);
    }

    return handleApiError(error);
  }
}
