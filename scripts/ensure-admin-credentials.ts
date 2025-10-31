import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function ensureAdminCredentials() {
  try {
    console.log('🔧 Ensuring admin credentials are correct...')
    
    const adminEmail = 'admin@vanityhub.com'
    const adminPassword = 'Admin33#'
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        staffProfile: true,
        clientProfile: true,
      }
    })

    if (existingAdmin) {
      console.log('✅ Admin user found, updating credentials...')
      
      // Update the admin user with correct password and role
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      })
      
      console.log('✅ Admin credentials updated successfully')
      console.log('')
      console.log('👤 Admin Login Credentials:')
      console.log('   Email: admin@vanityhub.com')
      console.log('   Password: Admin33#')
      console.log('   Role:', existingAdmin.role, '→ ADMIN')
      
      // Verify the password works
      const isPasswordValid = await bcrypt.compare(adminPassword, hashedPassword)
      console.log('   Password hash verification:', isPasswordValid ? '✅ VALID' : '❌ INVALID')
      
    } else {
      console.log('⚠️  Admin user not found, creating new admin...')
      
      // Create new admin user
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      })
      
      console.log('✅ Created new admin user successfully')
      console.log('')
      console.log('👤 Admin Login Credentials:')
      console.log('   Email: admin@vanityhub.com')
      console.log('   Password: Admin33#')
      console.log('   Role: ADMIN')
    }
    
    // Test the credentials
    console.log('')
    console.log('🧪 Testing login credentials...')
    const testUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (testUser) {
      const isValid = await bcrypt.compare(adminPassword, testUser.password)
      console.log('   Login test:', isValid ? '✅ SUCCESS - Credentials are valid' : '❌ FAILED - Password mismatch')
      console.log('   User ID:', testUser.id)
      console.log('   Role:', testUser.role)
      console.log('   Is Active:', testUser.isActive)
    }
    
  } catch (error) {
    console.error('❌ Error ensuring admin credentials:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

ensureAdminCredentials()
