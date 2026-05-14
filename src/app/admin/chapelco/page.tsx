import { AdminShell } from "@/components/admin-shell";
import { getCurrentReservationsUserOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { CHAPELCO_BOOKING_MODE } from "@/lib/chapelco/constants";
import { getChapelcoAvailability, listChapelcoOperationDay } from "@/lib/chapelco/repository";
import { OperationBoard } from "./operation-board";

type ChapelcoAdminPageProps = {
  searchParams?: Promise<{
    date?: string;
    notice?: string;
  }>;
};

function todayInputValue() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Salta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function serviceDateFromKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export default async function ChapelcoAdminPage({ searchParams }: ChapelcoAdminPageProps) {
  const user = await getCurrentReservationsUserOrRedirect();
  const params = await searchParams;
  const serviceDate = params?.date ?? todayInputValue();
  const route = await prisma.travelRoute.findFirst({
    where: {
      bookingMode: CHAPELCO_BOOKING_MODE,
      specialType: "CHAPELCO"
    }
  });

  if (!route) {
    return (
      <AdminShell title="Chapelco" notice="Primero crea la ruta especial Chapelco." role={user.role}>
        <p className="muted">No encontramos una ruta con bookingMode CHAPELCO.</p>
      </AdminShell>
    );
  }

  const [operationDay, vehicles, drivers, reservations, availability] = await Promise.all([
    listChapelcoOperationDay(route.id, serviceDate),
    prisma.vehicle.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { seats: true }
        }
      }
    }),
    prisma.user.findMany({
      where: {
        role: "DRIVER",
        isActive: true
      },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: {
        id: true,
        name: true,
        email: true
      }
    }),
    prisma.reservation.findMany({
      where: {
        routeId: route.id,
        bookingMode: CHAPELCO_BOOKING_MODE,
        status: {
          in: ["PENDING_PAYMENT", "CONFIRMED"]
        },
        chapelcoDetails: {
          serviceDate: serviceDateFromKey(serviceDate)
        }
      },
      include: {
        passenger: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        payment: {
          select: {
            status: true
          }
        },
        chapelcoDetails: {
          select: {
            ascentSlot: true,
            pickupName: true,
            pickupAddress: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    }),
    getChapelcoAvailability(route.id, serviceDate)
  ]);

  return (
    <AdminShell title="Chapelco" notice={params?.notice} role={user.role}>
      <OperationBoard
        routeId={route.id}
        serviceDate={serviceDate}
        operationDay={operationDay}
        vehicles={vehicles}
        drivers={drivers}
        reservations={reservations}
        availability={availability}
      />
    </AdminShell>
  );
}
