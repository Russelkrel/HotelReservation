import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'qjrpmagpantay@tip.edu.ph';
  
  console.log(`🔍 Looking for user: ${email}`);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    console.log(`❌ User not found: ${email}`);
    return;
  }
  
  console.log(`✅ Found user: ${user.name} (${user.email})`);
  console.log(`   Current role: ${user.role}`);
  
  // Update user to ADMIN
  const updatedUser = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
  
  console.log(`✅ Role updated to: ${updatedUser.role}`);
  console.log(`📋 User is now an ADMIN`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
