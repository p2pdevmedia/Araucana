import { NextResponse } from "next/server";
import { AuthorizationError, requireDriverUser } from "@/lib/auth/service";
import { prisma } from "@/lib/db/prisma";
import { handleApiError, jsonError } from "@/lib/api/responses";

export async function GET(request: Request) {
  try {
    const user = await requireDriverUser(request);
    const [vehicles, currentLocation] = await Promise.all([
      prisma.vehicle.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          brand: true,
          model: true,
          licensePlate: true
        }
      }),
      prisma.driverVehicleLocation.findUnique({
        where: { driverId: user.id },
        include: {
          vehicle: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      user,
      vehicles,
      currentLocation: currentLocation
        ? {
            vehicleId: currentLocation.vehicleId,
            vehicleName: currentLocation.vehicle.name,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            accuracy: currentLocation.accuracy,
            heading: currentLocation.heading,
            speed: currentLocation.speed,
            recordedAt: currentLocation.recordedAt.toISOString(),
            updatedAt: currentLocation.updatedAt.toISOString()
          }
        : null
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError("UNAUTHORIZED", error.message, 401);
    }

    return handleApiError(error);
  }
}
