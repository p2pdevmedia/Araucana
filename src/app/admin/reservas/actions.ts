"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdminOrRedirect } from "@/lib/auth/admin";
import { approveManualPayment, BookingError } from "@/lib/booking/repository";

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
