"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { errorState, type AdminFieldErrors, type AdminFormState } from "../form-state";

const scheduleStatuses = new Set(["OPEN", "DOCUMENTATION", "CLOSED"]);

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

class FormValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: AdminFieldErrors
  ) {
    super(message);
  }
}

function parseDeparture(raw: string) {
  if (!raw) {
    throw new FormValidationError("Revisa los campos marcados para guardar la salida.", {
      departureAt: "Elegi fecha y hora de salida."
    });
  }

  const normalized = raw.includes(":") ? raw : `${raw}T00:00`;
  const date = new Date(`${normalized}:00-03:00`);

  if (Number.isNaN(date.getTime())) {
    throw new FormValidationError("Revisa los campos marcados para guardar la salida.", {
      departureAt: "La fecha de salida no es valida."
    });
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
  const fieldErrors: AdminFieldErrors = {};

  if (!routeId) {
    fieldErrors.routeId = "Elegi una ruta para la salida.";
  }

  if (!vehicleId) {
    fieldErrors.vehicleId = "Elegi una nave para la salida.";
  }

  if (Object.keys(fieldErrors).length) {
    throw new FormValidationError("Revisa los campos marcados para guardar la salida.", fieldErrors);
  }

  if (!scheduleStatuses.has(status)) {
    throw new FormValidationError("Revisa los campos marcados para guardar la salida.", {
      status: "El estado seleccionado no es valido."
    });
  }

  const route = await prisma.travelRoute.findUnique({
    where: { id: routeId },
    select: { durationMin: true, slug: true }
  });

  if (!route) {
    throw new FormValidationError("Revisa los campos marcados para guardar la salida.", {
      routeId: "La ruta seleccionada ya no existe."
    });
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

function scheduleErrorState(error: unknown) {
  if (error instanceof FormValidationError) {
    return errorState(error.message, error.fieldErrors);
  }

  return errorState("No pudimos guardar la salida. Intentalo nuevamente.");
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

export async function createScheduleAction(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await getCurrentAdminOrRedirect();

  let routeSlug: string;
  try {
    const schedule = await scheduleData(formData);
    routeSlug = schedule.routeSlug;
    await prisma.schedule.create({ data: schedule.data });
  } catch (error) {
    return scheduleErrorState(error);
  }

  revalidateSchedulePaths(routeSlug);
  redirect(`/admin/salidas?notice=${encodeURIComponent("Salida guardada con exito.")}`);
}

export async function updateScheduleAction(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  if (!id) {
    return errorState("Falta la salida a editar. Volve a abrirla desde el listado.");
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
  let routeSlug: string;
  try {
    const schedule = await scheduleData(formData);
    routeSlug = schedule.routeSlug;
    await prisma.schedule.update({ where: { id }, data: schedule.data });
  } catch (error) {
    return scheduleErrorState(error);
  }

  revalidateSchedulePaths(current?.route.slug);
  revalidateSchedulePaths(routeSlug);
  redirect(`/admin/salidas?notice=${encodeURIComponent("Salida guardada con exito.")}`);
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
  redirect(`/admin/salidas?notice=${encodeURIComponent("Salida actualizada con exito.")}`);
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

  let notice = "Salida borrada con exito.";
  if (reservations > 0) {
    await prisma.schedule.update({ where: { id }, data: { status: "CLOSED" } });
    notice = "Salida cerrada con exito porque ya tenia reservas.";
  } else {
    await prisma.schedule.delete({ where: { id } });
  }

  revalidateSchedulePaths(schedule.route.slug);
  redirect(`/admin/salidas?notice=${encodeURIComponent(notice)}`);
}
