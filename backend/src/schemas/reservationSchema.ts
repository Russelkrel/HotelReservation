import { z } from 'zod';

export const createReservationSchema = z.object({
  roomId: z.number().positive('Room ID must be positive'),
  checkInDate: z.string().datetime('Invalid check-in date'),
  checkOutDate: z.string().datetime('Invalid check-out date'),
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be PENDING, CONFIRMED, or CANCELLED' })
  }),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusSchema>;
