import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { registerSchema, loginSchema, RegisterInput, LoginInput } from '../schemas/authSchema';
import { generateAccessToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { email, password, name } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'GUEST',
      },
    });

    // Generate token
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePictureUrl: user.profilePictureUrl,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const { email, password } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePictureUrl: user.profilePictureUrl,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePictureUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    console.log('updateProfile called, user:', req.user);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, email, profilePictureUrl } = req.body;
    console.log('Request body:', { name, email, profilePictureUrlLength: profilePictureUrl?.length });

    // Validate input
    if (!name && !email && !profilePictureUrl) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Validate profilePictureUrl size (base64 strings should be reasonable)
    if (profilePictureUrl && profilePictureUrl.length > 5000000) {
      return res.status(400).json({ error: 'Profile picture is too large' });
    }

    // Check if new email is already taken (if changing email)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== req.user.userId) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(profilePictureUrl !== undefined && { profilePictureUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePictureUrl: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete user (cascades to reservations)
    await prisma.user.delete({
      where: { id: req.user.userId },
    });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
