import { NextResponse } from "next/server";
import { handleApiError, jsonError } from "@/lib/api/responses";
import { attachManualPaymentReceipt, BookingError } from "@/lib/booking/repository";
import { storeManualPaymentReceipt, validateReceiptFile } from "@/lib/payments/receipt-storage";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { code } = await context.params;
    const reservationCode = code.toUpperCase();
    const formData = await request.formData();
    const receipt = formData.get("receipt");

    if (!(receipt instanceof File)) {
      return jsonError("VALIDATION_ERROR", "Subi un comprobante valido.", 400, {
        receipt: "El archivo receipt es requerido."
      });
    }

    const validationError = validateReceiptFile(receipt);
    if (validationError) {
      return jsonError("VALIDATION_ERROR", validationError, 400, {
        receipt: validationError
      });
    }

    const storedReceipt = await storeManualPaymentReceipt(reservationCode, receipt);
    const reservation = await attachManualPaymentReceipt(reservationCode, storedReceipt);

    return NextResponse.json({ reservation });
  } catch (error) {
    if (error instanceof BookingError) {
      const status = error.code === "RESERVATION_NOT_FOUND" ? 404 : 400;
      return jsonError(error.code, error.message, status);
    }

    return handleApiError(error);
  }
}
