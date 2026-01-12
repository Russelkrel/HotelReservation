import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { name: 'John Doe' }
  })
  
  if (!user) {
    console.log('❌ John Doe not found')
    process.exit(1)
  }
  
  const newPassword = 'password123'
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  })
  
  console.log('✅ Password reset successfully')
  console.log('📧 Email:', user.email)
  console.log('🔑 New Password:', newPassword)
}

main().catch(e => console.error(e)).finally(() => process.exit(0))
