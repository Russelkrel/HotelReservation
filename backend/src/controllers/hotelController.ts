import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createHotelSchema, updateHotelSchema } from '../schemas/hotelSchema.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadToCloudinary.js';

const prisma = new PrismaClient();

export const createHotel = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const result = createHotelSchema.safeParse(body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    let imageUrl: string | undefined;

    // Handle image upload if present
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file, {
          folder: 'hotels',
        });
        imageUrl = uploadResult.url;
      } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    const hotel = await prisma.hotel.create({
      data: {
        name: result.data.name,
        location: result.data.location,
        description: result.data.description,
        rating: result.data.rating || 0,
        imageUrl,
      },
    });

    res.status(201).json({ message: 'Hotel created successfully', hotel });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
};

export const getAllHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await prisma.hotel.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        description: true,
        rating: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(hotels);
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(id) },
      include: {
        rooms: true,
      },
    });

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.status(200).json(hotel);
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const result = updateHotelSchema.safeParse(body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const existingHotel = await prisma.hotel.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingHotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    let imageUrl = existingHotel.imageUrl;

    // Handle image upload if present
    if (req.file) {
      try {
        // Delete old image if exists
        if (existingHotel.imageUrl) {
          const publicId = existingHotel.imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await deleteFromCloudinary(`hotels/${publicId}`);
          }
        }

        const uploadResult = await uploadToCloudinary(req.file, {
          folder: 'hotels',
        });
        imageUrl = uploadResult.url;
      } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id: parseInt(id) },
      data: {
        name: result.data.name || existingHotel.name,
        location: result.data.location || existingHotel.location,
        description: result.data.description !== undefined ? result.data.description : existingHotel.description,
        rating: result.data.rating !== undefined ? result.data.rating : existingHotel.rating,
        imageUrl,
      },
      include: {
        rooms: true,
      },
    });

    res.status(200).json({ message: 'Hotel updated successfully', hotel: updatedHotel });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingHotel = await prisma.hotel.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingHotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Delete image from Cloudinary if exists
    if (existingHotel.imageUrl) {
      try {
        const publicId = existingHotel.imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await deleteFromCloudinary(`hotels/${publicId}`);
        }
      } catch (error) {
        console.error('Delete image error:', error);
      }
    }

    await prisma.hotel.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
};
