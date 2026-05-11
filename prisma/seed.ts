import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { routes } from "../src/lib/travel-data";

const prisma = new PrismaClient();

const VEHICLE_ID = "veh-araucana-24";

function parseDurationMin(duration: string) {
  const hoursMatch = duration.match(/(\d+)\s*h/);
  const minutesMatch = duration.match(/(\d+)\s*m/);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

  return hours * 60 + minutes;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function main() {
  await prisma.user.upsert({
    where: { email: "kevin@jefe.com" },
    update: {
      name: "Kevin",
      role: "ADMIN",
      isActive: true,
      passwordHash: await hashPassword("kieroMoverElBote")
    },
    create: {
      email: "kevin@jefe.com",
      name: "Kevin",
      role: "ADMIN",
      isActive: true,
      passwordHash: await hashPassword("kieroMoverElBote")
    }
  });

  await prisma.vehicle.upsert({
    where: { id: VEHICLE_ID },
    update: {
      name: "Araucana 24"
    },
    create: {
      id: VEHICLE_ID,
      name: "Araucana 24"
    }
  });

  const seatsByNumber = new Map<string, Awaited<ReturnType<typeof prisma.seat.upsert>>>();

  for (let index = 1; index <= 24; index += 1) {
    const number = String(index).padStart(2, "0");

    const seat = await prisma.seat.upsert({
      where: {
        vehicleId_number: {
          vehicleId: VEHICLE_ID,
          number
        }
      },
      update: {
        row: Math.ceil(index / 4),
        column: ((index - 1) % 4) + 1
      },
      create: {
        vehicleId: VEHICLE_ID,
        number,
        row: Math.ceil(index / 4),
        column: ((index - 1) % 4) + 1
      }
    });

    seatsByNumber.set(number, seat);
  }

  const durationByRouteId = new Map<string, number>();
  const routesByOriginalId = new Map<string, Awaited<ReturnType<typeof prisma.travelRoute.upsert>>>();
  const routesBySlug = new Map<string, Awaited<ReturnType<typeof prisma.travelRoute.upsert>>>();

  for (const route of routes) {
    const durationMin = parseDurationMin(route.duration);
    durationByRouteId.set(route.id, durationMin);

    const savedRoute = await prisma.travelRoute.upsert({
      where: { slug: route.slug },
      update: {
        from: route.from,
        to: route.to,
        via: route.via,
        durationMin,
        priceCents: route.price * 100,
        currency: "ARS",
        category: route.category,
        description: route.description,
        featured: route.featured ?? false,
        isActive: true,
        stops: route.stops
      },
      create: {
        id: route.id,
        slug: route.slug,
        from: route.from,
        to: route.to,
        via: route.via,
        durationMin,
        priceCents: route.price * 100,
        currency: "ARS",
        category: route.category,
        description: route.description,
        featured: route.featured ?? false,
        isActive: true,
        stops: route.stops
      }
    });

    routesByOriginalId.set(route.id, savedRoute);
    routesBySlug.set(route.slug, savedRoute);
  }

  const schedules = [
    {
      id: "sched-sma-bariloche-20261112-0830",
      routeKey: "r1",
      departureAt: new Date("2026-11-12T08:30:00-03:00"),
      status: "OPEN"
    },
    {
      id: "sched-sma-bariloche-20261112-1400",
      routeKey: "r1",
      departureAt: new Date("2026-11-12T14:00:00-03:00"),
      status: "OPEN"
    },
    {
      id: "sched-sma-pucon-20261113-0700",
      routeKey: "r4",
      departureAt: new Date("2026-11-13T07:00:00-03:00"),
      status: "DOCUMENTATION"
    }
  ];

  const schedulesByKey = new Map<string, Awaited<ReturnType<typeof prisma.schedule.upsert>>>();

  for (const schedule of schedules) {
    const route = routesByOriginalId.get(schedule.routeKey) ?? routesBySlug.get(schedule.routeKey);
    const durationMin = durationByRouteId.get(schedule.routeKey);

    if (!route || !durationMin) {
      throw new Error(`Missing route seed data for ${schedule.routeKey}`);
    }

    const savedSchedule = await prisma.schedule.upsert({
      where: { id: schedule.id },
      update: {
        routeId: route.id,
        vehicleId: VEHICLE_ID,
        departureAt: schedule.departureAt,
        arrivalAt: addMinutes(schedule.departureAt, durationMin),
        status: schedule.status
      },
      create: {
        id: schedule.id,
        routeId: route.id,
        vehicleId: VEHICLE_ID,
        departureAt: schedule.departureAt,
        arrivalAt: addMinutes(schedule.departureAt, durationMin),
        status: schedule.status
      }
    });

    schedulesByKey.set(schedule.id, savedSchedule);
  }

  const exampleReservations = [
    {
      id: "res-arc-2511-a6x",
      code: "ARC-2511-A6X",
      scheduleId: "sched-sma-bariloche-20261112-0830",
      passenger: {
        id: "passenger-camila-vidal",
        firstName: "Camila",
        lastName: "Vidal",
        email: "camila.vidal@example.com",
        phone: "+54 9 2972 555001",
        documentType: "DNI",
        documentId: "32111222",
        nationality: "AR"
      },
      seatNumber: "16",
      status: "CONFIRMED",
      totalCents: 18900 * 100,
      payment: {
        id: "payment-arc-2511-a6x",
        provider: "MERCADOPAGO",
        status: "APPROVED",
        externalRef: "mp-arc-2511-a6x"
      },
      ticket: {
        id: "ticket-arc-2511-a6x",
        code: "TKT-ARC-2511-A6X"
      }
    },
    {
      id: "res-arc-2511-b9k",
      code: "ARC-2511-B9K",
      scheduleId: "sched-sma-pucon-20261113-0700",
      passenger: {
        id: "passenger-martin-keller",
        firstName: "Martin",
        lastName: "Keller",
        email: "martin.keller@example.com",
        phone: "+54 9 2944 555002",
        documentType: "PASSPORT",
        documentId: "XK902144",
        nationality: "DE"
      },
      seatNumber: "08",
      status: "DOCUMENTATION_PENDING",
      totalCents: 32400 * 100,
      payment: {
        id: "payment-arc-2511-b9k",
        provider: "MERCADOPAGO",
        status: "PENDING",
        externalRef: "mp-arc-2511-b9k"
      },
      ticket: {
        id: "ticket-arc-2511-b9k",
        code: "TKT-ARC-2511-B9K"
      }
    }
  ];

  for (const reservation of exampleReservations) {
    const passenger = await prisma.passenger.upsert({
      where: { id: reservation.passenger.id },
      update: {
        firstName: reservation.passenger.firstName,
        lastName: reservation.passenger.lastName,
        email: reservation.passenger.email,
        phone: reservation.passenger.phone,
        documentType: reservation.passenger.documentType,
        documentId: reservation.passenger.documentId,
        nationality: reservation.passenger.nationality
      },
      create: reservation.passenger
    });

    const schedule = schedulesByKey.get(reservation.scheduleId);
    const seat = seatsByNumber.get(reservation.seatNumber);

    if (!schedule || !seat) {
      throw new Error(`Missing schedule or seat for reservation ${reservation.code}`);
    }

    const savedReservation = await prisma.reservation.upsert({
      where: { code: reservation.code },
      update: {
        scheduleId: schedule.id,
        passengerId: passenger.id,
        seatId: seat.id,
        seatNumber: seat.number,
        status: reservation.status,
        totalCents: reservation.totalCents,
        currency: "ARS"
      },
      create: {
        id: reservation.id,
        code: reservation.code,
        scheduleId: schedule.id,
        passengerId: passenger.id,
        seatId: seat.id,
        seatNumber: seat.number,
        status: reservation.status,
        totalCents: reservation.totalCents,
        currency: "ARS"
      }
    });

    await prisma.payment.upsert({
      where: { reservationId: savedReservation.id },
      update: {
        provider: reservation.payment.provider,
        status: reservation.payment.status,
        amountCents: reservation.totalCents,
        currency: "ARS",
        externalRef: reservation.payment.externalRef
      },
      create: {
        id: reservation.payment.id,
        reservationId: savedReservation.id,
        provider: reservation.payment.provider,
        status: reservation.payment.status,
        amountCents: reservation.totalCents,
        currency: "ARS",
        externalRef: reservation.payment.externalRef
      }
    });

    await prisma.ticket.upsert({
      where: { reservationId: savedReservation.id },
      update: {
        code: reservation.ticket.code,
        qrPayload: JSON.stringify({
          reservationCode: reservation.code,
          ticketCode: reservation.ticket.code,
          scheduleId: schedule.id,
          seatNumber: seat.number
        })
      },
      create: {
        id: reservation.ticket.id,
        reservationId: savedReservation.id,
        code: reservation.ticket.code,
        qrPayload: JSON.stringify({
          reservationCode: reservation.code,
          ticketCode: reservation.ticket.code,
          scheduleId: schedule.id,
          seatNumber: seat.number
        })
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
