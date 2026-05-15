"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentReservationsUserOrRedirect } from "@/lib/auth/admin";
import { CHAPELCO_BOOKING_MODE } from "@/lib/chapelco/constants";
import { prisma } from "@/lib/db/prisma";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function chapelcoRedirect(date: string, notice: string) {
  redirect(`/admin/chapelco?date=${encodeURIComponent(date)}&notice=${encodeURIComponent(notice)}`);
}

function serviceDateFromKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function updateChapelcoSeasonAction(formData: FormData) {
  await getCurrentReservationsUserOrRedirect();
  const routeId = value(formData, "routeId");
  const serviceDate = value(formData, "serviceDate") || value(formData, "serviceStartDate");
  const serviceStartDate = value(formData, "serviceStartDate");
  const serviceEndDate = value(formData, "serviceEndDate");

  if (!routeId || !isDateKey(serviceStartDate) || !isDateKey(serviceEndDate)) {
    chapelcoRedirect(serviceDate, "Completa fecha inicio y fecha fin de Chapelco.");
  }

  if (serviceDateFromKey(serviceStartDate) > serviceDateFromKey(serviceEndDate)) {
    chapelcoRedirect(serviceDate, "La fecha inicio no puede ser posterior a la fecha fin.");
  }

  const updated = await prisma.travelRoute.updateMany({
    where: {
      id: routeId,
      bookingMode: CHAPELCO_BOOKING_MODE
    },
    data: {
      serviceStartDate: serviceDateFromKey(serviceStartDate),
      serviceEndDate: serviceDateFromKey(serviceEndDate)
    }
  });

  if (updated.count === 0) {
    chapelcoRedirect(serviceDate, "No encontramos la ruta Chapelco para actualizar.");
  }

  revalidatePath("/admin/chapelco");
  revalidatePath("/reservar/chapelco");
  chapelcoRedirect(serviceDate, "Temporada Chapelco guardada.");
}
