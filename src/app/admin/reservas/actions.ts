"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { approveManualPayment, BookingError, updatePassengerForReservation } from "@/lib/booking/repository";
import { passengerSchema } from "@/lib/booking/validation";
import {
  errorState,
  fieldErrorsFromZodError,
  successState,
  type AdminFormState
} from "../form-state";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

export async function approveManualPaymentAction(formData: FormData) {
  await getCurrentAdminOrRedirect();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();

  if (!code) {
    return;
  }

  try {
    await approveManualPayment(code);
    revalidatePath("/admin/reservas");
    revalidatePath(`/reservas/${code}`);
  } catch (error) {
    if (error instanceof BookingError && error.code === "RECEIPT_NOT_FOUND") {
      return;
    }

    throw error;
  }
}

export async function updatePassengerAction(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await getCurrentAdminOrRedirect();
  const code = value(formData, "code").toUpperCase();

  if (!code) {
    return errorState("Falta el codigo de reserva. Volve a abrirla desde el listado.");
  }

  const parsed = passengerSchema.safeParse({
    firstName: value(formData, "firstName"),
    lastName: value(formData, "lastName"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    documentType: value(formData, "documentType"),
    documentId: value(formData, "documentId"),
    nationality: value(formData, "nationality") || null
  });

  if (!parsed.success) {
    return errorState("Revisa los campos marcados para guardar el pasajero.", fieldErrorsFromZodError(parsed.error));
  }

  try {
    await updatePassengerForReservation(code, parsed.data);
  } catch (error) {
    if (error instanceof BookingError && error.code === "RESERVATION_NOT_FOUND") {
      return errorState("La reserva ya no existe. Volve al listado y buscala nuevamente.");
    }

    return errorState("No pudimos guardar el pasajero. Intentalo nuevamente.");
  }

  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${code}`);
  revalidatePath(`/reservas/${code}`);
  return successState("Pasajero guardado con exito.");
}
