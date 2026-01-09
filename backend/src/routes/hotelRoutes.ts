import { Router } from 'express';
import { createHotel, getAllHotels, getHotelById, updateHotel, deleteHotel } from '../controllers/hotelController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getAllHotels);
router.get('/:id', getHotelById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createHotel);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateHotel);
router.delete('/:id', authMiddleware, adminMiddleware, deleteHotel);

export default router;
