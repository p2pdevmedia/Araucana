"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { approveManualPayment, BookingError, updatePassengerForReservation } from "@/lib/booking/repository";
import { passengerSchema } from "@/lib/booking/validation";

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

export async function updatePassengerAction(formData: FormData) {
  await getCurrentAdminOrRedirect();
  const code = value(formData, "code").toUpperCase();

  if (!code) {
    throw new Error("Falta el codigo de reserva.");
  }

  const passenger = passengerSchema.parse({
    firstName: value(formData, "firstName"),
    lastName: value(formData, "lastName"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    documentType: value(formData, "documentType"),
    documentId: value(formData, "documentId"),
    nationality: value(formData, "nationality") || null
  });

  await updatePassengerForReservation(code, passenger);
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${code}`);
  revalidatePath(`/reservas/${code}`);
}
