import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setSimplePassword() {
  try {
    const email = 'admin@vanityhub.com'
    const newPassword = 'Admin2024'
    
    console.log('🔄 Setting simple password...')
    
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      },
      create: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    })
    
    console.log('✅ Password set successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', newPassword)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('👤 User ID:', user.id)
    console.log('🔒 Role:', user.role)
    console.log('✓ Active:', user.isActive)
    
    // Verify it works
    const testMatch = await bcrypt.compare(newPassword, hashedPassword)
    console.log('\n🔐 Password verification:', testMatch ? '✅ VALID' : '❌ INVALID')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setSimplePassword()
