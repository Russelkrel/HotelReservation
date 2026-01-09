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

  const hotel4 = await prisma.hotel.create({
    data: {
      name: 'Manila Bay Resort',
      location: 'Manila, Philippines',
      description: 'Tropical paradise with stunning bay views and warm hospitality',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
    },
  });

  const hotel5 = await prisma.hotel.create({
    data: {
      name: 'Royal London Palace',
      location: 'London, UK',
      description: 'Historic luxury hotel in the heart of Westminster',
      rating: 4.9,
      imageUrl: 'https://placehold.co/500x300/1e40af/ffffff?text=London+Palace',
    },
  });

  const hotel6 = await prisma.hotel.create({
    data: {
      name: 'Tokyo Zen Gardens',
      location: 'Tokyo, Japan',
      description: 'Modern luxury meets traditional Japanese aesthetics',
      rating: 4.8,
      imageUrl: 'https://placehold.co/500x300/dc2626/ffffff?text=Tokyo+Zen',
    },
  });

  console.log('✅ Created 6 hotels');

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
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Safe'],
      },
      {
        roomNumber: '102',
        hotelId: hotel1.id,
        type: 'Double',
        price: 149,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Safe', 'Coffee Maker', 'Mini Bar'],
      },
      {
        roomNumber: '103',
        hotelId: hotel1.id,
        type: 'Suite',
        price: 249,
        capacity: 4,
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Safe', 'Coffee Maker', 'Mini Bar', 'Spa', 'Hot Tub'],
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
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Balcony', 'Safe'],
      },
      {
        roomNumber: '202',
        hotelId: hotel2.id,
        type: 'Double',
        price: 139,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Balcony', 'Safe', 'Coffee Maker', 'Swimming Pool Access'],
      },
      {
        roomNumber: '203',
        hotelId: hotel2.id,
        type: 'Suite',
        price: 229,
        capacity: 4,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Balcony', 'Safe', 'Coffee Maker', 'Swimming Pool Access', 'Hot Tub', 'Gym Access'],
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
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Parking'],
      },
      {
        roomNumber: '302',
        hotelId: hotel3.id,
        type: 'Double',
        price: 129,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Parking', 'Coffee Maker', 'Balcony'],
      },
      {
        roomNumber: '303',
        hotelId: hotel3.id,
        type: 'Suite',
        price: 199,
        capacity: 4,
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Parking', 'Coffee Maker', 'Balcony', 'Gym Access', 'Spa'],
      },
    ],
  });

  // Create rooms for Manila Bay Resort
  await prisma.room.createMany({
    data: [
      {
        roomNumber: '401',
        hotelId: hotel4.id,
        type: 'Single',
        price: 69,
        capacity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Balcony', 'Safe'],
      },
      {
        roomNumber: '402',
        hotelId: hotel4.id,
        type: 'Double',
        price: 119,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Balcony', 'Safe', 'Swimming Pool Access', 'Coffee Maker'],
      },
      {
        roomNumber: '403',
        hotelId: hotel4.id,
        type: 'Suite',
        price: 189,
        capacity: 4,
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Balcony', 'Safe', 'Swimming Pool Access', 'Coffee Maker', 'Spa', 'Hot Tub'],
      },
    ],
  });

  // Create rooms for Royal London Palace
  await prisma.room.createMany({
    data: [
      {
        roomNumber: '501',
        hotelId: hotel5.id,
        type: 'Single',
        price: 129,
        capacity: 1,
        imageUrl: 'https://placehold.co/400x300/1e40af/ffffff?text=Single',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Safe', 'Coffee Maker'],
      },
      {
        roomNumber: '502',
        hotelId: hotel5.id,
        type: 'Double',
        price: 179,
        capacity: 2,
        imageUrl: 'https://placehold.co/400x300/1e40af/ffffff?text=Double',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Safe', 'Coffee Maker', 'Mini Bar', 'Balcony'],
      },
      {
        roomNumber: '503',
        hotelId: hotel5.id,
        type: 'Suite',
        price: 299,
        capacity: 4,
        imageUrl: 'https://placehold.co/400x300/1e40af/ffffff?text=Suite',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Safe', 'Coffee Maker', 'Mini Bar', 'Spa', 'Hot Tub', 'Gym Access'],
      },
    ],
  });

  // Create rooms for Tokyo Zen Gardens
  await prisma.room.createMany({
    data: [
      {
        roomNumber: '601',
        hotelId: hotel6.id,
        type: 'Single',
        price: 99,
        capacity: 1,
        imageUrl: 'https://placehold.co/400x300/dc2626/ffffff?text=Single',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Safe'],
      },
      {
        roomNumber: '602',
        hotelId: hotel6.id,
        type: 'Double',
        price: 159,
        capacity: 2,
        imageUrl: 'https://placehold.co/400x300/dc2626/ffffff?text=Double',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Safe', 'Coffee Maker', 'Balcony'],
      },
      {
        roomNumber: '603',
        hotelId: hotel6.id,
        type: 'Suite',
        price: 249,
        capacity: 4,
        imageUrl: 'https://placehold.co/400x300/dc2626/ffffff?text=Suite',
        amenities: ['WiFi', 'Air Conditioning', 'TV', 'Work Desk', 'Safe', 'Coffee Maker', 'Spa', 'Hot Tub', 'Gym Access', 'Parking'],
      },
    ],
  });

  console.log('✅ Created 18 rooms (3 per hotel)');
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
