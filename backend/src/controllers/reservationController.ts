import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import moment from 'moment-timezone';
import { createReservationSchema, updateReservationStatusSchema } from '../schemas/reservationSchema';
import { calculateCancellation } from '../utils/cancellationPolicy';
import { sendBookingConfirmation, sendCancellationConfirmation } from '../utils/emailService';
import { generateBookingPDF } from '../utils/pdfGenerator';

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

    // Validate dates using hotel's timezone
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const hotelTimezone = room.hotel.timezone || 'UTC';
    const today = moment().tz(hotelTimezone).startOf('day').toDate();
    
    // Check if check-in date is in the past relative to hotel timezone
    if (checkIn < today) {
      return res.status(400).json({ 
        error: `Check-in date cannot be in the past (Hotel timezone: ${hotelTimezone})` 
      });
    }
    
    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
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

    // Send booking confirmation email
    try {
      const checkInFormatted = checkIn.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const checkOutFormatted = checkOut.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      await sendBookingConfirmation({
        userEmail: reservation.user.email,
        userName: reservation.user.name,
        hotelName: reservation.room.hotel.name,
        roomType: reservation.room.type,
        checkInDate: checkInFormatted,
        checkOutDate: checkOutFormatted,
        totalPrice: reservation.totalPrice,
        reservationId: reservation.id.toString()
      });
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

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

// Get cancellation info for a reservation
export const getCancellationInfo = async (req: any, res: Response) => {
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

    // Calculate cancellation info
    const cancellationInfo = calculateCancellation(
      reservation.checkInDate,
      reservation.totalPrice
    );

    res.json({
      ...cancellationInfo,
      checkInDate: reservation.checkInDate,
      totalPrice: reservation.totalPrice
    });
  } catch (error: any) {
    console.error('Get cancellation info error:', error);
    res.status(500).json({ error: 'Failed to fetch cancellation info' });
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

    // Calculate refund based on cancellation policy
    const cancellationInfo = calculateCancellation(
      reservation.checkInDate,
      reservation.totalPrice
    );

    const cancelled = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { 
        status: 'CANCELLED',
        refundAmount: cancellationInfo.refundAmount,
        cancellationDate: new Date()
      },
      include: {
        room: { include: { hotel: true } },
        user: { select: { id: true, email: true, name: true } }
      }
    });

    // Send cancellation confirmation email
    try {
      await sendCancellationConfirmation(
        cancelled.user.email,
        cancelled.user.name,
        cancelled.id.toString(),
        cancellationInfo.refundAmount
      );
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    res.json({
      message: 'Reservation cancelled successfully',
      reservation: cancelled,
      refundInfo: {
        policy: cancellationInfo.policy,
        refundPercentage: cancellationInfo.refundPercentage,
        refundAmount: cancellationInfo.refundAmount
      }
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

// Modify reservation dates
export const modifyReservation = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ error: 'Check-in and check-out dates are required' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    // Fetch reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: { room: { include: { hotel: true } }, user: true }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Check authorization
    if (reservation.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if reservation is modifiable
    if (reservation.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot modify a cancelled reservation' });
    }

    // Check check-in is in the future (at least 48 hours)
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    if (checkIn <= twoDaysFromNow) {
      return res.status(400).json({ error: 'Cannot modify dates - check-in must be at least 48 hours away' });
    }

    // Check for conflicting reservations with new dates
    const conflict = await prisma.reservation.findFirst({
      where: {
        roomId: reservation.roomId,
        id: { not: parseInt(id) },
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
      return res.status(400).json({ error: 'Room is already booked for the new dates' });
    }

    // Calculate new total price
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const newTotalPrice = reservation.room.price * nights;

    // Update reservation
    const updated = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice: newTotalPrice,
        lastModifiedDate: new Date(),
        modificationCount: { increment: 1 }
      },
      include: {
        room: { include: { hotel: true } },
        user: { select: { id: true, email: true, name: true } }
      }
    });

    res.json({
      message: 'Reservation dates modified successfully',
      reservation: updated,
      priceChange: newTotalPrice - reservation.totalPrice
    });
  } catch (error: any) {
    console.error('Modify reservation error:', error);
    res.status(500).json({ error: 'Failed to modify reservation' });
  }
};

// Download reservation as PDF
export const downloadReservationPDF = async (req: any, res: Response) => {
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

    // Check authorization
    if (reservation.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Calculate nights
    const nights = Math.ceil(
      (new Date(reservation.checkOutDate).getTime() - new Date(reservation.checkInDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    const pdfStream = await generateBookingPDF({
      reservationId: reservation.id,
      hotelName: reservation.room.hotel.name,
      roomType: reservation.room.type,
      roomNumber: reservation.room.roomNumber,
      userName: reservation.user.name,
      userEmail: reservation.user.email,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      totalPrice: reservation.totalPrice,
      nights,
      pricePerNight: reservation.room.price
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="booking-${reservation.id}.pdf"`
    );

    pdfStream.pipe(res);
  } catch (error: any) {
    console.error('Download PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

