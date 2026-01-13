import { Router } from 'express';
import { createRoom, getRoomsByHotel, getAllRooms, updateRoom, deleteRoom } from '../controllers/roomController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getAllRooms);
router.get('/hotel/:hotelId', getRoomsByHotel);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createRoom);
router.post('/hotel/:hotelId', authMiddleware, adminMiddleware, upload.single('image'), createRoom);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateRoom);
router.delete('/:id', authMiddleware, adminMiddleware, deleteRoom);

export default router;
