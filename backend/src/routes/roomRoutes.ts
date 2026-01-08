import { Router } from 'express';
import { createRoom, getRoomsByHotel, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// Public route
router.get('/hotel/:hotelId', getRoomsByHotel);

// Admin only routes
router.post('/hotel/:hotelId', authMiddleware, adminMiddleware, upload.single('image'), createRoom);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateRoom);
router.delete('/:id', authMiddleware, adminMiddleware, deleteRoom);

export default router;
