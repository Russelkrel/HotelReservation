import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding users to database...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const guestPassword = await bcrypt.hash('guest123', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hotelreservation.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create guest user
  const guest = await prisma.user.create({
    data: {
      email: 'guest@hotelreservation.com',
      password: guestPassword,
      name: 'Guest User',
      role: 'GUEST',
    },
  });
  console.log('✅ Guest user created:', guest.email);

  console.log('\n📋 Login credentials:');
  console.log('Admin: admin@hotelreservation.com / admin123');
  console.log('Guest: guest@hotelreservation.com / guest123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
