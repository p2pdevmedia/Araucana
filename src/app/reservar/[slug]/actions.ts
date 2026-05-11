"use server";

import { BookingError, createWebReservation } from "@/lib/booking/repository";
import { createReservationSchema, type CreateReservationInput } from "@/lib/booking/validation";

type ReservationActionResult =
  | {
      ok: true;
      code: string;
    }
  | {
      ok: false;
      message: string;
    };

const bookingMessages: Record<string, string> = {
  SEAT_OCCUPIED: "Ese asiento ya fue reservado. Elegi otro asiento.",
  SCHEDULE_NOT_FOUND: "La salida seleccionada ya no esta disponible.",
  SEAT_NOT_FOUND: "El asiento seleccionado no existe para esta salida.",
  SCHEDULE_CLOSED: "La salida seleccionada ya no acepta reservas.",
  CODE_COLLISION: "No pudimos generar el codigo de reserva. Intentalo nuevamente."
};

export async function createReservationAction(input: CreateReservationInput): Promise<ReservationActionResult> {
  const parsed = createReservationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los datos de la reserva."
    };
  }

  try {
    const reservation = await createWebReservation(parsed.data);

    return {
      ok: true,
      code: reservation.code
    };
  } catch (error) {
    if (error instanceof BookingError) {
      return {
        ok: false,
        message: bookingMessages[error.code] ?? "No pudimos crear la reserva. Intentalo nuevamente."
      };
    }

    return {
      ok: false,
      message: "No pudimos crear la reserva. Intentalo nuevamente."
    };
  }
}
