"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

const scheduleStatuses = new Set(["OPEN", "DOCUMENTATION", "CLOSED"]);

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function parseDeparture(raw: string) {
  if (!raw) {
    throw new Error("Elegí fecha y hora de salida.");
  }

  const normalized = raw.includes(":") ? raw : `${raw}T00:00`;
  const date = new Date(`${normalized}:00-03:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("La fecha de salida no es válida.");
  }

  return date;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function scheduleData(formData: FormData) {
  const routeId = value(formData, "routeId");
  const vehicleId = value(formData, "vehicleId");
  const status = value(formData, "status") || "OPEN";

  if (!routeId || !vehicleId) {
    throw new Error("Elegí ruta y vehículo.");
  }

  if (!scheduleStatuses.has(status)) {
    throw new Error("Estado de salida inválido.");
  }

  const route = await prisma.travelRoute.findUnique({
    where: { id: routeId },
    select: { durationMin: true, slug: true }
  });

  if (!route) {
    throw new Error("La ruta seleccionada no existe.");
  }

  const departureAt = parseDeparture(value(formData, "departureAt"));

  return {
    data: {
      routeId,
      vehicleId,
      departureAt,
      arrivalAt: addMinutes(departureAt, route.durationMin),
      status
    },
    routeSlug: route.slug
  };
}

function revalidateSchedulePaths(routeSlug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/salidas");
  revalidatePath("/admin/rutas");
  revalidatePath("/rutas");

  if (routeSlug) {
    revalidatePath(`/reservar/${routeSlug}`);
  }
}

export async function createScheduleAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const { data, routeSlug } = await scheduleData(formData);
  await prisma.schedule.create({ data });
  revalidateSchedulePaths(routeSlug);
  redirect("/admin/salidas");
}

export async function updateScheduleAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  if (!id) {
    throw new Error("Falta la salida a editar.");
  }

  const current = await prisma.schedule.findUnique({
    where: { id },
    select: {
      route: {
        select: {
          slug: true
        }
      }
    }
  });
  const { data, routeSlug } = await scheduleData(formData);
  await prisma.schedule.update({ where: { id }, data });
  revalidateSchedulePaths(current?.route.slug);
  revalidateSchedulePaths(routeSlug);
  redirect("/admin/salidas");
}

export async function setScheduleStatusAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  const status = value(formData, "status");

  if (!scheduleStatuses.has(status)) {
    throw new Error("Estado de salida inválido.");
  }

  const schedule = await prisma.schedule.update({
    where: { id },
    data: { status },
    select: {
      route: {
        select: {
          slug: true
        }
      }
    }
  });
  revalidateSchedulePaths(schedule.route.slug);
}

export async function deleteScheduleAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    select: {
      route: {
        select: {
          slug: true
        }
      }
    }
  });

  if (!schedule) {
    return;
  }

  const reservations = await prisma.reservation.count({ where: { scheduleId: id } });

  if (reservations > 0) {
    await prisma.schedule.update({ where: { id }, data: { status: "CLOSED" } });
  } else {
    await prisma.schedule.delete({ where: { id } });
  }

  revalidateSchedulePaths(schedule.route.slug);
}
