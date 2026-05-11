import { NextResponse } from "next/server";
import { AuthorizationError, requireDriverUser } from "@/lib/auth/service";
import { prisma } from "@/lib/db/prisma";
import { parseDriverLocationInput } from "@/lib/driver/location";
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

    const savedLocation = await prisma.driverVehicleLocation.upsert({
      where: {
        driverId: user.id
      },
      update: location,
      create: {
        ...location,
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

    return NextResponse.json({
      location: {
        vehicleId: savedLocation.vehicleId,
        vehicleName: savedLocation.vehicle.name,
        latitude: savedLocation.latitude,
        longitude: savedLocation.longitude,
        accuracy: savedLocation.accuracy,
        heading: savedLocation.heading,
        speed: savedLocation.speed,
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
