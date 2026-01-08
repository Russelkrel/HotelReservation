import { Router } from 'express';
import {
  createReservation,
  getUserReservations,
  getReservationById,
  updateReservationStatus,
  cancelReservation,
  getAllReservations
} from '../controllers/reservationController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

// User routes
router.post('/', authMiddleware, createReservation);
router.get('/my-reservations', authMiddleware, getUserReservations);
router.get('/:id', authMiddleware, getReservationById);
router.delete('/:id', authMiddleware, cancelReservation);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllReservations);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateReservationStatus);

export default router;
