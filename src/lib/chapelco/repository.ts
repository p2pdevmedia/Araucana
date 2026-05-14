import { prisma } from "@/lib/db/prisma";
import { createReservationCode, createTicketCode } from "@/lib/booking/codes";
import { manualPaymentProvider } from "@/lib/payments/manual-provider";
import {
  CHAPELCO_BOOKING_MODE,
  chapelcoActiveReservationStatuses,
  chapelcoAscentSlots,
  type ChapelcoAscentSlot,
  type ChapelcoManifestStatus
} from "./constants";
import { availablePeople, canReservePeople, vehicleCapacityCountsForSlot, vehicleCanServeSlot } from "./availability";
import {
  chapelcoReservationSchema,
  operationDaySchema,
  runSchema,
  stopStatusSchema,
  vehicleDutySchema
} from "./validation";
import type {
  AssignReservationInput,
  ChapelcoAvailabilityDto,
  ChapelcoReservationInput,
  OperationDayInput,
  RunInput,
  StopStatusInput,
  VehicleDutyInput
} from "./types";

export class ChapelcoError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ChapelcoError";
  }
}

function serviceDateFromKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function serviceDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizePickupNotes(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizePassenger(input: ChapelcoReservationInput["passenger"]) {
  return {
    ...input,
    nationality: input.nationality?.trim() || null
  };
}

function asChapelcoSlot(value: string | null): ChapelcoAscentSlot | null {
  return chapelcoAscentSlots.includes(value as ChapelcoAscentSlot) ? (value as ChapelcoAscentSlot) : null;
}

function stopStatusAllowed(direction: string, status: ChapelcoManifestStatus) {
  if (direction === "UP") {
    return status === "PENDING" || status === "BOARDED" || status === "NO_SHOW";
  }

  return status === "PENDING" || status === "TRANSPORTED" || status === "NO_SHOW";
}

export async function getChapelcoRouteBySlug(slug: string) {
  return prisma.travelRoute.findFirst({
    where: {
      slug,
      bookingMode: CHAPELCO_BOOKING_MODE,
      isActive: true
    }
  });
}

export async function getChapelcoAvailability(routeId: string, serviceDate: string): Promise<ChapelcoAvailabilityDto> {
  const date = serviceDateFromKey(serviceDate);
  const operationDay = await prisma.chapelcoOperationDay.findUnique({
    where: {
      routeId_serviceDate: {
        routeId,
        serviceDate: date
      }
    },
    include: {
      vehicleDuties: {
        where: { status: "ACTIVE" },
        include: {
          runs: {
            where: { direction: "UP" },
            select: { ascentSlot: true }
          }
        }
      }
    }
  });
  const reservations = await prisma.reservation.findMany({
    where: {
      routeId,
      bookingMode: CHAPELCO_BOOKING_MODE,
      status: { in: [...chapelcoActiveReservationStatuses] },
      chapelcoDetails: {
        serviceDate: date
      }
    },
    select: {
      passengerCount: true,
      chapelcoDetails: {
        select: {
          ascentSlot: true
        }
      }
    }
  });

  return {
    routeId,
    serviceDate,
    slots: chapelcoAscentSlots.map((slot) => {
      const totalCapacity =
        operationDay?.vehicleDuties.reduce((total, duty) => {
          const assignedSlots = duty.runs
            .map((run) => asChapelcoSlot(run.ascentSlot))
            .filter((runSlot): runSlot is ChapelcoAscentSlot => Boolean(runSlot));

          return vehicleCapacityCountsForSlot(assignedSlots, slot) ? total + duty.capacity : total;
        }, 0) ?? 0;
      const reservedPeople = reservations.reduce(
        (total, reservation) =>
          reservation.chapelcoDetails?.ascentSlot === slot ? total + reservation.passengerCount : total,
        0
      );

      return {
        slot,
        totalCapacity,
        reservedPeople,
        availablePeople: availablePeople(totalCapacity, reservedPeople)
      };
    })
  };
}

export async function createChapelcoReservation(input: ChapelcoReservationInput) {
  const parsed = chapelcoReservationSchema.parse(input);
  const date = serviceDateFromKey(parsed.serviceDate);

  return prisma.$transaction(async (tx) => {
    const route = await tx.travelRoute.findFirst({
      where: {
        id: parsed.routeId,
        bookingMode: CHAPELCO_BOOKING_MODE,
        isActive: true
      }
    });

    if (!route) {
      throw new ChapelcoError("CHAPELCO_ROUTE_NOT_FOUND", "Chapelco route not found");
    }

    const operationDay = await tx.chapelcoOperationDay.findUnique({
      where: {
        routeId_serviceDate: {
          routeId: route.id,
          serviceDate: date
        }
      },
      include: {
        vehicleDuties: {
          where: { status: "ACTIVE" },
          include: {
            runs: {
              where: { direction: "UP" },
              select: { ascentSlot: true }
            }
          }
        }
      }
    });
    const totalCapacity =
      operationDay?.vehicleDuties.reduce((total, duty) => {
        const assignedSlots = duty.runs
          .map((run) => asChapelcoSlot(run.ascentSlot))
          .filter((runSlot): runSlot is ChapelcoAscentSlot => Boolean(runSlot));

        return vehicleCapacityCountsForSlot(assignedSlots, parsed.ascentSlot) ? total + duty.capacity : total;
      }, 0) ?? 0;
    const existingReservations = await tx.reservation.findMany({
      where: {
        routeId: route.id,
        bookingMode: CHAPELCO_BOOKING_MODE,
        status: { in: [...chapelcoActiveReservationStatuses] },
        chapelcoDetails: {
          serviceDate: date,
          ascentSlot: parsed.ascentSlot
        }
      },
      select: { passengerCount: true }
    });
    const reservedPeople = existingReservations.reduce((total, reservation) => total + reservation.passengerCount, 0);

    if (!canReservePeople(totalCapacity, reservedPeople, parsed.passengerCount)) {
      throw new ChapelcoError("CHAPELCO_CAPACITY_FULL", "No capacity for selected Chapelco slot");
    }

    const passenger = await tx.passenger.create({
      data: normalizePassenger(parsed.passenger)
    });
    const code = createReservationCode();
    const reservation = await tx.reservation.create({
      data: {
        code,
        routeId: route.id,
        passengerId: passenger.id,
        passengerCount: parsed.passengerCount,
        bookingMode: CHAPELCO_BOOKING_MODE,
        status: "PENDING_PAYMENT",
        totalCents: route.priceCents * parsed.passengerCount,
        currency: route.currency
      }
    });

    await tx.chapelcoReservationDetails.create({
      data: {
        reservationId: reservation.id,
        serviceDate: date,
        ascentSlot: parsed.ascentSlot,
        pickupName: parsed.pickupName.trim(),
        pickupAddress: parsed.pickupAddress.trim(),
        pickupLatitude: parsed.pickupLatitude,
        pickupLongitude: parsed.pickupLongitude,
        pickupNotes: normalizePickupNotes(parsed.pickupNotes)
      }
    });

    const payment = await manualPaymentProvider.createPendingPayment({
      reservationCode: code,
      amountCents: reservation.totalCents,
      currency: reservation.currency
    });
    await tx.payment.create({
      data: {
        reservationId: reservation.id,
        provider: payment.provider,
        status: payment.status,
        amountCents: payment.amountCents,
        currency: payment.currency,
        externalRef: payment.externalRef
      }
    });

    const ticketCode = createTicketCode(code);
    await tx.ticket.create({
      data: {
        reservationId: reservation.id,
        code: ticketCode,
        qrPayload: JSON.stringify({
          reservationCode: code,
          ticketCode,
          routeId: route.id,
          bookingMode: CHAPELCO_BOOKING_MODE,
          serviceDate: parsed.serviceDate,
          ascentSlot: parsed.ascentSlot,
          passengerCount: parsed.passengerCount
        })
      }
    });

    return {
      code,
      route,
      reservation: {
        ...reservation,
        passenger,
        chapelcoDetails: {
          serviceDate: date,
          ascentSlot: parsed.ascentSlot,
          pickupName: parsed.pickupName.trim(),
          pickupAddress: parsed.pickupAddress.trim(),
          pickupLatitude: parsed.pickupLatitude,
          pickupLongitude: parsed.pickupLongitude,
          pickupNotes: normalizePickupNotes(parsed.pickupNotes)
        }
      }
    };
  });
}

export async function listChapelcoOperationDay(routeId: string, serviceDate: string) {
  return prisma.chapelcoOperationDay.findUnique({
    where: {
      routeId_serviceDate: {
        routeId,
        serviceDate: serviceDateFromKey(serviceDate)
      }
    },
    include: {
      vehicleDuties: {
        include: {
          vehicle: true,
          driver: true,
          runs: {
            include: {
              stops: {
                include: {
                  reservation: {
                    include: {
                      passenger: true,
                      payment: true,
                      chapelcoDetails: true
                    }
                  }
                },
                orderBy: { stopOrder: "asc" }
              }
            },
            orderBy: [{ direction: "asc" }, { ascentSlot: "asc" }, { sequence: "asc" }]
          }
        },
        orderBy: { createdAt: "asc" }
      },
      runs: {
        include: {
          vehicleDuty: {
            include: {
              vehicle: true,
              driver: true
            }
          },
          stops: {
            include: {
              reservation: {
                include: {
                  passenger: true,
                  payment: true,
                  chapelcoDetails: true
                }
              }
            },
            orderBy: { stopOrder: "asc" }
          }
        },
        orderBy: [{ direction: "asc" }, { ascentSlot: "asc" }, { sequence: "asc" }]
      }
    }
  });
}

export async function upsertChapelcoOperationDay(input: OperationDayInput) {
  const parsed = operationDaySchema.parse(input);
  const serviceDate = serviceDateFromKey(parsed.serviceDate);

  return prisma.chapelcoOperationDay.upsert({
    where: {
      routeId_serviceDate: {
        routeId: parsed.routeId,
        serviceDate
      }
    },
    update: {
      status: parsed.status
    },
    create: {
      routeId: parsed.routeId,
      serviceDate,
      status: parsed.status
    }
  });
}

export async function addChapelcoVehicleDuty(input: VehicleDutyInput) {
  const parsed = vehicleDutySchema.parse(input);

  return prisma.chapelcoVehicleDuty.upsert({
    where: {
      operationDayId_vehicleId: {
        operationDayId: parsed.operationDayId,
        vehicleId: parsed.vehicleId
      }
    },
    update: {
      driverId: parsed.driverId ?? null,
      capacity: parsed.capacity,
      notes: normalizePickupNotes(parsed.notes),
      status: "ACTIVE"
    },
    create: {
      operationDayId: parsed.operationDayId,
      vehicleId: parsed.vehicleId,
      driverId: parsed.driverId ?? null,
      capacity: parsed.capacity,
      notes: normalizePickupNotes(parsed.notes)
    }
  });
}

export async function createChapelcoRun(input: RunInput) {
  const parsed = runSchema.parse(input);

  if (parsed.direction === "UP" && !parsed.ascentSlot) {
    throw new ChapelcoError("ASCENT_SLOT_REQUIRED", "Ascent runs require a slot");
  }

  return prisma.$transaction(async (tx) => {
    const duty = await tx.chapelcoVehicleDuty.findUnique({
      where: { id: parsed.vehicleDutyId },
      include: {
        runs: {
          where: { direction: "UP" },
          select: { ascentSlot: true }
        }
      }
    });

    if (!duty || duty.operationDayId !== parsed.operationDayId) {
      throw new ChapelcoError("VEHICLE_DUTY_NOT_FOUND", "Vehicle duty not found");
    }

    if (parsed.direction === "UP" && parsed.ascentSlot) {
      const existingSlots = duty.runs
        .map((run) => asChapelcoSlot(run.ascentSlot))
        .filter((slot): slot is ChapelcoAscentSlot => Boolean(slot));

      if (!vehicleCanServeSlot(existingSlots, parsed.ascentSlot)) {
        throw new ChapelcoError("VEHICLE_SLOT_CONFLICT", "Vehicle is not available for this slot");
      }
    }

    const existingRuns = await tx.chapelcoRun.count({
      where: {
        operationDayId: parsed.operationDayId,
        direction: parsed.direction
      }
    });

    return tx.chapelcoRun.create({
      data: {
        operationDayId: parsed.operationDayId,
        vehicleDutyId: parsed.vehicleDutyId,
        direction: parsed.direction,
        ascentSlot: parsed.direction === "UP" ? parsed.ascentSlot : null,
        sequence: existingRuns + 1
      }
    });
  });
}

export async function assignReservationToRun(input: AssignReservationInput) {
  return prisma.$transaction(async (tx) => {
    const [run, reservation] = await Promise.all([
      tx.chapelcoRun.findUnique({
        where: { id: input.runId },
        include: {
          vehicleDuty: true,
          stops: true
        }
      }),
      tx.reservation.findUnique({
        where: { id: input.reservationId },
        include: {
          chapelcoDetails: true
        }
      })
    ]);

    if (!run) {
      throw new ChapelcoError("RUN_NOT_FOUND", "Chapelco run not found");
    }

    if (!reservation || reservation.bookingMode !== CHAPELCO_BOOKING_MODE || !reservation.chapelcoDetails) {
      throw new ChapelcoError("RESERVATION_NOT_CHAPELCO", "Reservation is not a Chapelco reservation");
    }

    if (run.direction === "UP" && reservation.chapelcoDetails.ascentSlot !== run.ascentSlot) {
      throw new ChapelcoError("RESERVATION_SLOT_MISMATCH", "Reservation slot does not match run slot");
    }

    const assignedPeople = run.stops.reduce((total, stop) => total + stop.passengerCount, 0);
    if (assignedPeople + reservation.passengerCount > run.vehicleDuty.capacity) {
      throw new ChapelcoError("RUN_CAPACITY_FULL", "Run capacity exceeded");
    }

    const maxOrder = run.stops.reduce((max, stop) => Math.max(max, stop.stopOrder), 0);

    return tx.chapelcoManifestStop.create({
      data: {
        runId: run.id,
        reservationId: reservation.id,
        stopOrder: maxOrder + 1,
        passengerCount: reservation.passengerCount,
        pickupName: reservation.chapelcoDetails.pickupName,
        pickupAddress: reservation.chapelcoDetails.pickupAddress,
        pickupLatitude: reservation.chapelcoDetails.pickupLatitude,
        pickupLongitude: reservation.chapelcoDetails.pickupLongitude
      }
    });
  });
}

export async function reorderChapelcoStops(runId: string, orderedStopIds: string[]) {
  return prisma.$transaction(
    orderedStopIds.map((id, index) =>
      prisma.chapelcoManifestStop.update({
        where: { id },
        data: {
          runId,
          stopOrder: index + 1
        }
      })
    )
  );
}

export async function updateChapelcoStopStatus(input: StopStatusInput) {
  const parsed = stopStatusSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const stop = await tx.chapelcoManifestStop.findUnique({
      where: { id: parsed.stopId },
      include: { run: true }
    });

    if (!stop) {
      throw new ChapelcoError("STOP_NOT_FOUND", "Chapelco stop not found");
    }

    if (!stopStatusAllowed(stop.run.direction, parsed.status)) {
      throw new ChapelcoError("STOP_STATUS_INVALID", "Stop status is not allowed for run direction");
    }

    return tx.chapelcoManifestStop.update({
      where: { id: parsed.stopId },
      data: {
        status: parsed.status,
        checkedAt: parsed.status === "PENDING" ? null : new Date()
      }
    });
  });
}

export async function getDriverChapelcoManifest(driverId: string, serviceDate: string) {
  return prisma.chapelcoRun.findMany({
    where: {
      operationDay: {
        serviceDate: serviceDateFromKey(serviceDate)
      },
      vehicleDuty: {
        driverId
      }
    },
    include: {
      operationDay: {
        include: {
          route: true
        }
      },
      vehicleDuty: {
        include: {
          vehicle: true
        }
      },
      stops: {
        include: {
          reservation: {
            include: {
              passenger: true,
              chapelcoDetails: true
            }
          }
        },
        orderBy: { stopOrder: "asc" }
      }
    },
    orderBy: [{ direction: "asc" }, { ascentSlot: "asc" }, { sequence: "asc" }]
  });
}

export function todayServiceDateKey(now = new Date()) {
  return serviceDateKey(now);
}
