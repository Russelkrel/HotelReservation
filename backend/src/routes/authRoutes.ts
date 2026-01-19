import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);
router.delete('/account', authMiddleware, deleteAccount);

export default router;
