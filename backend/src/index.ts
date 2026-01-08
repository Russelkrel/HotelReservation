import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/hotels', hotelRoutes);
app.use('/rooms', roomRoutes);
app.use('/reservations', reservationRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
