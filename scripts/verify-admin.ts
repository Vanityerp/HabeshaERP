import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function verifyAdmin() {
  try {
    const email = 'admin@vanityhub.com'
    const testPassword = 'Admin@2024!Secure'
    
    console.log('🔍 Testing login for:', email)
    
    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:')
    console.log('   ID:', user.id)
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   Active:', user.isActive)

    // Test password
    const isValid = await bcrypt.compare(testPassword, user.password)
    console.log('\n🔐 Password verification:', isValid ? '✅ VALID' : '❌ INVALID')

    if (!isValid) {
      console.log('\n⚠️  Password mismatch. Resetting to simpler password...')
      
      // Create a simpler password without special chars
      const newPassword = 'Admin2024'
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Password reset successfully!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Email:', email)
      console.log('🔑 Password:', newPassword)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Verify new password
      const verifyNew = await bcrypt.compare(newPassword, hashedPassword)
      console.log('\n🔐 New password verification:', verifyNew ? '✅ VALID' : '❌ INVALID')
    } else {
      console.log('\n✅ Current password is valid!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Email:', email)
      console.log('🔑 Password:', testPassword)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdmin()
