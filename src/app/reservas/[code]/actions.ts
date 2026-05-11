"use server";

import { revalidatePath } from "next/cache";
import { attachManualPaymentReceipt, BookingError } from "@/lib/booking/repository";
import { storeManualPaymentReceipt, validateReceiptFile } from "@/lib/payments/receipt-storage";

export type UploadReceiptState = {
  ok: boolean;
  message: string;
};

export async function uploadManualPaymentReceiptAction(
  _previousState: UploadReceiptState,
  formData: FormData
): Promise<UploadReceiptState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const receipt = formData.get("receipt");

  if (!code) {
    return {
      ok: false,
      message: "No encontramos el codigo de reserva."
    };
  }

  if (!(receipt instanceof File)) {
    return {
      ok: false,
      message: "Subi un comprobante valido."
    };
  }

  const validationError = validateReceiptFile(receipt);
  if (validationError) {
    return {
      ok: false,
      message: validationError
    };
  }

  try {
    const storedReceipt = await storeManualPaymentReceipt(code, receipt);
    await attachManualPaymentReceipt(code, storedReceipt);
    revalidatePath(`/reservas/${code}`);

    return {
      ok: true,
      message: "Comprobante recibido. El equipo de Araucana va a validar el pago."
    };
  } catch (error) {
    if (error instanceof BookingError && error.code === "RESERVATION_NOT_FOUND") {
      return {
        ok: false,
        message: "No encontramos esa reserva."
      };
    }

    return {
      ok: false,
      message: "No pudimos subir el comprobante. Intentalo nuevamente."
    };
  }
}
