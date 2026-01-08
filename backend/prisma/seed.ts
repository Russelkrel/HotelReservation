import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.reservation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();

  // Create hotels
  const hotel1 = await prisma.hotel.create({
    data: {
      name: 'Luxury Plaza Hotel',
      location: 'New York City',
      description: 'Experience luxury in the heart of Manhattan',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop',
    },
  });

  const hotel2 = await prisma.hotel.create({
    data: {
      name: 'Beachfront Resort',
      location: 'Miami, Florida',
      description: 'Beautiful oceanfront resort with stunning views',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop',
    },
  });

  const hotel3 = await prisma.hotel.create({
    data: {
      name: 'Mountain View Hotel',
      location: 'Denver, Colorado',
      description: 'Scenic mountain views and outdoor activities',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    },
  });

  console.log('✅ Created 3 hotels');

  // Create rooms for Luxury Plaza Hotel
  await prisma.room.createMany({
    data: [
      {
        roomNumber: '101',
        hotelId: hotel1.id,
        type: 'Single',
        price: 99,
        capacity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
      },
      {
        roomNumber: '102',
        hotelId: hotel1.id,
        type: 'Double',
        price: 149,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
      },
      {
        roomNumber: '103',
        hotelId: hotel1.id,
        type: 'Suite',
        price: 249,
        capacity: 4,
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
      },
    ],
  });

  // Create rooms for Beachfront Resort
  await prisma.room.createMany({
    data: [
      {
        roomNumber: '201',
        hotelId: hotel2.id,
        type: 'Single',
        price: 89,
        capacity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      },
      {
        roomNumber: '202',
        hotelId: hotel2.id,
        type: 'Double',
        price: 139,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      },
      {
        roomNumber: '203',
        hotelId: hotel2.id,
        type: 'Suite',
        price: 229,
        capacity: 4,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      },
    ],
  });

  // Create rooms for Mountain View Hotel
  await prisma.room.createMany({
    data: [
      {
        roomNumber: '301',
        hotelId: hotel3.id,
        type: 'Single',
        price: 79,
        capacity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      },
      {
        roomNumber: '302',
        hotelId: hotel3.id,
        type: 'Double',
        price: 129,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      },
      {
        roomNumber: '303',
        hotelId: hotel3.id,
        type: 'Suite',
        price: 199,
        capacity: 4,
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      },
    ],
  });

  console.log('✅ Created 9 rooms (3 per hotel)');
  console.log('🌱 Database seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
