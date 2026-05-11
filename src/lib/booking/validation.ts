import { z } from "zod";

export const createReservationSchema = z.object({
  scheduleId: z.string().min(1),
  seatNumber: z.string().min(1),
  passenger: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    documentType: z.string().min(1),
    documentId: z.string().min(4),
    nationality: z.string().optional()
  })
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
