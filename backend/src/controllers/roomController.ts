import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createRoomSchema, updateRoomSchema } from '../schemas/hotelSchema';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadToCloudinary';

const prisma = new PrismaClient();

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const body = req.body;

    const result = createRoomSchema.safeParse({
      ...body,
      hotelId: parseInt(hotelId),
    });

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: result.data.hotelId },
    });

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    let imageUrl: string | undefined;

    // Handle image upload if present
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file, {
          folder: `hotels/${hotelId}/rooms`,
        });
        imageUrl = uploadResult.url;
      } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    const room = await prisma.room.create({
      data: {
        roomNumber: result.data.roomNumber,
        hotelId: result.data.hotelId,
        type: result.data.type,
        price: result.data.price,
        capacity: result.data.capacity,
        description: result.data.description,
        imageUrl,
        isAvailable: true,
      },
    });

    res.status(201).json({ message: 'Room created successfully', room });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const getRoomsByHotel = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(hotelId) },
    });

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const rooms = await prisma.room.findMany({
      where: { hotelId: parseInt(hotelId) },
    });

    res.status(200).json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const result = updateRoomSchema.safeParse(body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const existingRoom = await prisma.room.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    let imageUrl = existingRoom.imageUrl;

    // Handle image upload if present
    if (req.file) {
      try {
        // Delete old image if exists
        if (existingRoom.imageUrl) {
          const publicId = existingRoom.imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await deleteFromCloudinary(`hotels/${existingRoom.hotelId}/rooms/${publicId}`);
          }
        }

        const uploadResult = await uploadToCloudinary(req.file, {
          folder: `hotels/${existingRoom.hotelId}/rooms`,
        });
        imageUrl = uploadResult.url;
      } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    const updatedRoom = await prisma.room.update({
      where: { id: parseInt(id) },
      data: {
        roomNumber: result.data.roomNumber || existingRoom.roomNumber,
        type: result.data.type || existingRoom.type,
        price: result.data.price || existingRoom.price,
        capacity: result.data.capacity || existingRoom.capacity,
        description: result.data.description !== undefined ? result.data.description : existingRoom.description,
        imageUrl,
      },
    });

    res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingRoom = await prisma.room.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Delete image from Cloudinary if exists
    if (existingRoom.imageUrl) {
      try {
        const publicId = existingRoom.imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await deleteFromCloudinary(`hotels/${existingRoom.hotelId}/rooms/${publicId}`);
        }
      } catch (error) {
        console.error('Delete image error:', error);
      }
    }

    await prisma.room.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};
