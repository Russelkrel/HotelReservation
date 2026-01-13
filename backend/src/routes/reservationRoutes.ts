import { Router } from 'express';
import {
  createReservation,
  getUserReservations,
  getReservationById,
  updateReservationStatus,
  cancelReservation,
  getAllReservations,
  getCancellationInfo
} from '../controllers/reservationController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// User routes
router.post('/', authMiddleware, createReservation);
router.get('/my-reservations', authMiddleware, getUserReservations);
router.get('/:id/cancellation-info', authMiddleware, getCancellationInfo);
router.delete('/:id', authMiddleware, cancelReservation);
router.get('/:id', authMiddleware, getReservationById);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllReservations);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateReservationStatus);

export default router;
