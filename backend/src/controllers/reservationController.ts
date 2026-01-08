import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createReservationSchema, updateReservationStatusSchema } from '../schemas/reservationSchema.js';

const prisma = new PrismaClient();

// Create reservation
export const createReservation = async (req: any, res: Response) => {
  try {
    const validation = createReservationSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { roomId, checkInDate, checkOutDate } = validation.data;
    const userId = req.user.userId;

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    // Check if room exists and is available
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.isAvailable) {
      return res.status(400).json({ error: 'Room is not available' });
    }

    // Check for conflicting reservations
    const conflict = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: { not: 'CANCELLED' },
        OR: [
          {
            checkInDate: { lt: checkOut },
            checkOutDate: { gt: checkIn }
          }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({ error: 'Room is already booked for these dates' });
    }

    // Calculate total price
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice,
        status: 'PENDING'
      },
      include: {
        room: { include: { hotel: true } },
        user: { select: { id: true, email: true, name: true } }
      }
    });

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation
    });
  } catch (error: any) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
};

// Get user's reservations
export const getUserReservations = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        room: { include: { hotel: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reservations);
  } catch (error: any) {
    console.error('Get reservations error:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

// Get reservation by ID
export const getReservationById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: {
        room: { include: { hotel: true } },
        user: { select: { id: true, email: true, name: true } }
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check if user owns this reservation or is admin
    if (reservation.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(reservation);
  } catch (error: any) {
    console.error('Get reservation error:', error);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
};

// Update reservation status (admin only)
export const updateReservationStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateReservationStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { status } = validation.data;

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const updated = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        room: { include: { hotel: true } },
        user: { select: { id: true, email: true, name: true } }
      }
    });

    res.json({
      message: 'Reservation updated successfully',
      reservation: updated
    });
  } catch (error: any) {
    console.error('Update reservation error:', error);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
};

// Cancel reservation (user can cancel their own, admin can cancel any)
export const cancelReservation = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check authorization
    if (reservation.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (reservation.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Reservation is already cancelled' });
    }

    const cancelled = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
      include: {
        room: { include: { hotel: true } },
        user: { select: { id: true, email: true, name: true } }
      }
    });

    res.json({
      message: 'Reservation cancelled successfully',
      reservation: cancelled
    });
  } catch (error: any) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
};

// Get all reservations (admin only)
export const getAllReservations = async (req: any, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        room: { include: { hotel: true } },
        user: { select: { id: true, email: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reservations);
  } catch (error: any) {
    console.error('Get all reservations error:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};
