"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { getVehicleTemplate } from "@/lib/vehicles/templates";
import { parseSeatLayout } from "@/lib/vehicles/validation";
import { errorState, type AdminFieldErrors, type AdminFormState } from "../form-state";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function optionalValue(formData: FormData, key: string) {
  return value(formData, key) || null;
}

class FormValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: AdminFieldErrors
  ) {
    super(message);
  }
}

function vehicleData(formData: FormData) {
  const name = value(formData, "name");
  const brand = value(formData, "brand");
  const model = value(formData, "model");
  const templateKey = optionalValue(formData, "templateKey");
  const fieldErrors: AdminFieldErrors = {};

  if (!name) {
    fieldErrors.name = "Ingresa un nombre interno para identificar la nave.";
  }

  if (!brand) {
    fieldErrors.brand = "Ingresa la marca de la nave.";
  }

  if (!model) {
    fieldErrors.model = "Ingresa el modelo de la nave.";
  }

  if (templateKey && !getVehicleTemplate(templateKey)) {
    fieldErrors.templateKey = "La plantilla seleccionada ya no existe.";
  }

  let seats;
  try {
    seats = parseSeatLayout(value(formData, "seats"));
  } catch (error) {
    fieldErrors.seats = error instanceof Error ? error.message : "La distribucion de asientos no es valida.";
  }

  if (Object.keys(fieldErrors).length) {
    throw new FormValidationError("Revisa los campos marcados para guardar la nave.", fieldErrors);
  }

  return {
    vehicle: {
      name,
      brand,
      model,
      licensePlate: optionalValue(formData, "licensePlate"),
      templateKey,
      isActive: formData.get("isActive") === "on"
    },
    seats
  };
}

function vehicleErrorState(error: unknown) {
  if (error instanceof FormValidationError) {
    return errorState(error.message, error.fieldErrors);
  }

  return errorState(error instanceof Error ? error.message : "No pudimos guardar la nave. Intentalo nuevamente.");
}

function revalidateVehiclePaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/naves");
  revalidatePath("/admin/salidas");
}

export async function createVehicleAction(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await getCurrentAdminOrRedirect();

  try {
    const { vehicle, seats } = vehicleData(formData);
    await prisma.vehicle.create({
      data: {
        ...vehicle,
        seats: {
          create: seats
        }
      }
    });
  } catch (error) {
    return vehicleErrorState(error);
  }

  revalidateVehiclePaths();
  redirect(`/admin/naves?notice=${encodeURIComponent("Nave guardada con exito.")}`);
}

export async function updateVehicleAction(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  if (!id) {
    return errorState("Falta la nave a editar. Volve a abrirla desde el listado.");
  }

  try {
    const { vehicle, seats } = vehicleData(formData);

    await prisma.$transaction(async (tx) => {
      await tx.vehicle.update({
        where: { id },
        data: vehicle
      });

      const currentSeats = await tx.seat.findMany({
        where: { vehicleId: id },
        include: {
          _count: {
            select: {
              reservations: true
            }
          }
        }
      });
      const currentByNumber = new Map(currentSeats.map((seat) => [seat.number, seat]));
      const nextNumbers = new Set(seats.map((seat) => seat.number));

      for (const currentSeat of currentSeats) {
        if (nextNumbers.has(currentSeat.number)) {
          continue;
        }

        if (currentSeat._count.reservations > 0) {
          throw new FormValidationError("Revisa la distribucion de asientos.", {
            seats: `No se puede quitar el asiento ${currentSeat.number} porque ya tiene reservas.`
          });
        }

        await tx.seat.delete({ where: { id: currentSeat.id } });
      }

      for (const seat of seats) {
        const currentSeat = currentByNumber.get(seat.number);

        if (currentSeat) {
          await tx.seat.update({
            where: { id: currentSeat.id },
            data: {
              row: seat.row,
              column: seat.column
            }
          });
          continue;
        }

        await tx.seat.create({
          data: {
            vehicleId: id,
            ...seat
          }
        });
      }
    });
  } catch (error) {
    return vehicleErrorState(error);
  }

  revalidateVehiclePaths();
  redirect(`/admin/naves?notice=${encodeURIComponent("Nave guardada con exito.")}`);
}

export async function setVehicleActiveAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  const isActive = value(formData, "isActive") === "true";

  await prisma.vehicle.update({
    where: { id },
    data: { isActive }
  });

  revalidateVehiclePaths();
}

export async function deleteVehicleAction(formData: FormData) {
  await getCurrentAdminOrRedirect();

  const id = value(formData, "id");
  const scheduleCount = await prisma.schedule.count({ where: { vehicleId: id } });

  if (scheduleCount > 0) {
    await prisma.vehicle.update({
      where: { id },
      data: { isActive: false }
    });
  } else {
    await prisma.vehicle.delete({ where: { id } });
  }

  revalidateVehiclePaths();
}
