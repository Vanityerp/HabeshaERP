import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function debugLogin() {
  try {
    console.log('🔍 Debugging login issue...\n')
    
    // Check database connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('   ✅ Database connected\n')
    
    // Check if admin user exists
    console.log('2. Checking admin user...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@vanityhub.com' },
      include: {
        staffProfile: true
      }
    })
    
    if (!adminUser) {
      console.log('   ❌ Admin user NOT found in database!')
      console.log('   Creating admin user...')
      
      const hashedPassword = await bcrypt.hash('Admin33#', 10)
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@vanityhub.com',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        }
      })
      console.log('   ✅ Admin user created successfully')
      console.log(`      ID: ${newAdmin.id}`)
      return
    }
    
    console.log('   ✅ Admin user exists')
    console.log(`      ID: ${adminUser.id}`)
    console.log(`      Email: ${adminUser.email}`)
    console.log(`      Role: ${adminUser.role}`)
    console.log(`      Active: ${adminUser.isActive}`)
    console.log(`      Has Password: ${adminUser.password ? 'Yes' : 'No'}`)
    console.log(`      Password Hash Length: ${adminUser.password?.length || 0}\n`)
    
    // Test passwords
    console.log('3. Testing passwords...')
    const testPasswords = ['Admin33#', 'admin123', 'Admin123#', 'admin', '']
    
    for (const pwd of testPasswords) {
      try {
        const match = await bcrypt.compare(pwd, adminUser.password)
        if (match) {
          console.log(`   ✅ MATCH: "${pwd}"`)
          console.log(`\n🎉 Working credentials:`)
          console.log(`   Email: admin@vanityhub.com`)
          console.log(`   Password: ${pwd}\n`)
          return
        } else {
          console.log(`   ❌ No match: "${pwd}"`)
        }
      } catch (err) {
        console.log(`   ⚠️ Error testing "${pwd}": ${err}`)
      }
    }
    
    console.log('\n4. Password hash verification...')
    console.log(`   Current hash: ${adminUser.password.substring(0, 20)}...`)
    console.log(`   Hash starts with $2a$ or $2b$: ${adminUser.password.startsWith('$2a$') || adminUser.password.startsWith('$2b$')}`)
    
    // Reset password to known value
    console.log('\n5. Resetting password to "Admin33#"...')
    const newHash = await bcrypt.hash('Admin33#', 10)
    await prisma.user.update({
      where: { email: 'admin@vanityhub.com' },
      data: {
        password: newHash,
        isActive: true,
        role: 'ADMIN'
      }
    })
    console.log('   ✅ Password reset successfully')
    
    // Verify the reset worked
    const verifyMatch = await bcrypt.compare('Admin33#', newHash)
    console.log(`   Verification: ${verifyMatch ? '✅ Password works' : '❌ Password failed'}`)
    
    console.log('\n📋 Final credentials:')
    console.log('   Email: admin@vanityhub.com')
    console.log('   Password: Admin33#')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLogin()
