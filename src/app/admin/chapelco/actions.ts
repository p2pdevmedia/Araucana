"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentReservationsUserOrRedirect } from "@/lib/auth/admin";
import { chapelcoAscentSlots, type ChapelcoAscentSlot } from "@/lib/chapelco/constants";
import {
  addChapelcoVehicleDuty,
  assignReservationToRun,
  createChapelcoRun,
  upsertChapelcoOperationDay
} from "@/lib/chapelco/repository";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function chapelcoRedirect(date: string, notice: string) {
  redirect(`/admin/chapelco?date=${encodeURIComponent(date)}&notice=${encodeURIComponent(notice)}`);
}

function ascentSlotOrNull(value: string): ChapelcoAscentSlot | null {
  return chapelcoAscentSlots.includes(value as ChapelcoAscentSlot) ? (value as ChapelcoAscentSlot) : null;
}

export async function upsertOperationDayAction(formData: FormData) {
  await getCurrentReservationsUserOrRedirect();
  const routeId = value(formData, "routeId");
  const serviceDate = value(formData, "serviceDate");

  await upsertChapelcoOperationDay({
    routeId,
    serviceDate,
    status: value(formData, "status") || "OPEN"
  });

  revalidatePath("/admin/chapelco");
  chapelcoRedirect(serviceDate, "Operativo Chapelco guardado.");
}

export async function addVehicleDutyAction(formData: FormData) {
  await getCurrentReservationsUserOrRedirect();
  const serviceDate = value(formData, "serviceDate");

  await addChapelcoVehicleDuty({
    operationDayId: value(formData, "operationDayId"),
    vehicleId: value(formData, "vehicleId"),
    driverId: value(formData, "driverId") || null,
    capacity: Number(value(formData, "capacity")),
    notes: value(formData, "notes") || null
  });

  revalidatePath("/admin/chapelco");
  chapelcoRedirect(serviceDate, "Nave agregada al operativo.");
}

export async function createRunAction(formData: FormData) {
  await getCurrentReservationsUserOrRedirect();
  const serviceDate = value(formData, "serviceDate");

  await createChapelcoRun({
    operationDayId: value(formData, "operationDayId"),
    vehicleDutyId: value(formData, "vehicleDutyId"),
    direction: value(formData, "direction") === "DOWN" ? "DOWN" : "UP",
    ascentSlot: ascentSlotOrNull(value(formData, "ascentSlot"))
  });

  revalidatePath("/admin/chapelco");
  chapelcoRedirect(serviceDate, "Recorrido creado.");
}

export async function assignReservationAction(formData: FormData) {
  await getCurrentReservationsUserOrRedirect();
  const serviceDate = value(formData, "serviceDate");

  await assignReservationToRun({
    runId: value(formData, "runId"),
    reservationId: value(formData, "reservationId")
  });

  revalidatePath("/admin/chapelco");
  chapelcoRedirect(serviceDate, "Reserva asignada.");
}
