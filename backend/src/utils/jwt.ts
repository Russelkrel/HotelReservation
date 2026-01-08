import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret-key', {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    return decoded as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
};
