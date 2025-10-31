import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupProductionAdmin() {
  try {
    console.log('🔧 Setting up production admin user...')
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@vanityhub.com' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin33#', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@vanityhub.com',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
      },
    })

    console.log('✅ Created admin user successfully')
    console.log('👤 Admin credentials:')
    console.log('   Email: admin@vanityhub.com')
    console.log('   Password: Admin33#')
    console.log('')
    console.log('⚠️  IMPORTANT: Please change the default password after first login!')
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupProductionAdmin()