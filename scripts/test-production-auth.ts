import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAuth() {
  console.log('🧪 Testing production authentication...')
  
  try {
    // Test database connection
    console.log('🔗 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test finding the admin user
    console.log('🔍 Looking for admin user...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@vanityhub.com' },
      include: {
        staffProfile: {
          include: {
            locations: {
              include: {
                location: true
              }
            }
          }
        }
      }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found in database')
      return
    }
    
    console.log('✅ Admin user found:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      isActive: adminUser.isActive
    })
    
    // Test password hash
    console.log('🔑 Testing password verification...')
    const passwordMatch = await bcrypt.compare('Admin33#', adminUser.password)
    console.log('🔑 Password verification result:', passwordMatch)
    
    if (!passwordMatch) {
      console.log('❌ Password does not match')
      return
    }
    
    console.log('🎉 All tests passed! Authentication should work.')
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()