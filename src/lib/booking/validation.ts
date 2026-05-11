import { z } from "zod";

export const passengerSchema = z.object({
  firstName: z.string().min(2, "Ingresa el nombre del pasajero."),
  lastName: z.string().min(2, "Ingresa el apellido del pasajero."),
  email: z.string().email("Ingresa un email valido."),
  phone: z.string().min(6, "Ingresa un telefono valido con codigo de pais."),
  documentType: z.string().min(1, "Selecciona el tipo de documento."),
  documentId: z.string().min(4, "Ingresa un documento valido."),
  nationality: z.string().nullable().optional()
});

export const createReservationSchema = z.object({
  scheduleId: z.string().min(1, "Selecciona una salida."),
  seatNumber: z.string().min(1, "Selecciona un asiento."),
  passenger: passengerSchema
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type PassengerInput = z.infer<typeof passengerSchema>;
