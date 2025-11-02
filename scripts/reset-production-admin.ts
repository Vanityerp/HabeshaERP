import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetProductionAdmin() {
  try {
    console.log('🔄 Resetting admin credentials for production...')
    
    const adminEmail = 'admin@vanityhub.com'
    const adminPassword = 'Admin@2024!Secure'
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    if (existingAdmin) {
      // Update existing admin
      const admin = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      })
      
      console.log('✅ Admin user updated successfully!')
      console.log('📧 Email:', adminEmail)
      console.log('🔑 Password:', adminPassword)
      console.log('👤 User ID:', admin.id)
      console.log('🔒 Role:', admin.role)
    } else {
      // Create new admin
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      })
      
      console.log('✅ Admin user created successfully!')
      console.log('📧 Email:', adminEmail)
      console.log('🔑 Password:', adminPassword)
      console.log('👤 User ID:', admin.id)
      console.log('🔒 Role:', admin.role)
    }

    console.log('\n⚠️  IMPORTANT: Save these credentials securely!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('❌ Error resetting admin credentials:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetProductionAdmin()
