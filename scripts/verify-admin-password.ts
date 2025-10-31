import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function verifyAdminPassword() {
  try {
    console.log('🔍 Checking admin credentials...\n')
    
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@vanityhub.com' }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found!')
      return
    }
    
    console.log('✅ Admin user found')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   Active: ${adminUser.isActive}\n`)
    
    // Test the password from seed.ts
    const passwords = ['Admin33#', 'admin123', 'Admin123#', 'admin']
    
    console.log('🔐 Testing passwords:')
    for (const pwd of passwords) {
      const match = await bcrypt.compare(pwd, adminUser.password)
      console.log(`   ${pwd}: ${match ? '✅ MATCH' : '❌ No match'}`)
      if (match) {
        console.log(`\n✨ Correct password found: ${pwd}`)
        console.log('\n📋 Login Credentials:')
        console.log(`   Email: admin@vanityhub.com`)
        console.log(`   Password: ${pwd}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdminPassword()
