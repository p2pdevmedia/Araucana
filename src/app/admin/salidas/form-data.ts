import { listAdminRoutes } from "@/lib/booking/repository";
import { prisma } from "@/lib/db/prisma";

export async function getScheduleFormData() {
  const [routes, vehicles] = await Promise.all([
    listAdminRoutes(),
    prisma.vehicle.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            seats: true
          }
        }
      }
    })
  ]);

  return { routes, vehicles };
}
