import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updateAdminPassword() {
  console.log('🔐 Updating admin password...')

  try {
    // Hash the new password
    const newPassword = 'Admin33#'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the admin user
    const admin = await prisma.user.update({
      where: { email: 'admin@vanityhub.com' },
      data: {
        password: hashedPassword,
        isActive: true,
      },
    })

    console.log('✅ Admin password updated successfully!')
    console.log('📧 Email: admin@vanityhub.com')
    console.log('🔑 Password: Admin33#')
    console.log('👤 Role:', admin.role)
    console.log('✓ Active:', admin.isActive)
  } catch (error) {
    console.error('❌ Error updating admin password:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminPassword()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

