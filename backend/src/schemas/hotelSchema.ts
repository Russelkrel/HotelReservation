import { z } from 'zod';

export const createHotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  timezone: z.string().optional().default('UTC'),
});

export const updateHotelSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  description: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  timezone: z.string().optional(),
});

export const createRoomSchema = z.object({
  hotelId: z.number().int(),
  roomNumber: z.string().min(1, 'Room number is required'),
  type: z.string().min(1, 'Room type is required'),
  price: z.number().positive('Price must be positive'),
  capacity: z.number().int().positive('Capacity must be positive'),
  description: z.string().optional(),
});

export const updateRoomSchema = z.object({
  roomNumber: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional(),
});

export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
