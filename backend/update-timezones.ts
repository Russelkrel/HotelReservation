import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateHotelTimezones() {
  console.log('🕐 Updating hotel timezones...');

  // Map locations to timezones
  const locationTimezones: { [key: string]: string } = {
    'New York City': 'America/New_York',
    'Miami, Florida': 'America/New_York',
    'Denver, Colorado': 'America/Denver',
    'Manila, Philippines': 'Asia/Manila',
    'Tokyo, Japan': 'Asia/Tokyo'
  };

  const hotels = await prisma.hotel.findMany();

  for (const hotel of hotels) {
    let timezone = 'UTC'; // Default
    
    // Find matching timezone based on location
    for (const [location, tz] of Object.entries(locationTimezones)) {
      if (hotel.location.includes(location)) {
        timezone = tz;
        break;
      }
    }

    await prisma.hotel.update({
      where: { id: hotel.id },
      data: { timezone }
    });

    console.log(`✅ ${hotel.name} (${hotel.location}) → ${timezone}`);
  }

  console.log('🎉 Hotel timezones updated successfully!');
}

updateHotelTimezones()
  .catch(console.error)
  .finally(() => prisma.$disconnect());