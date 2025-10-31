import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Use the exact DATABASE_URL from Vercel production
const DATABASE_URL = "postgres://postgres.dzdgtmebfgdvglgldlph:jFq87cdhsdJnkigC@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function testProductionDB() {
  try {
    console.log('🔍 Testing PRODUCTION database...\n')
    console.log(`Database: ${DATABASE_URL.split('@')[1]?.split('/')[0]}\n`)
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to production database\n')
    
    // Check admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@vanityhub.com' }
    })
    
    if (!admin) {
      console.log('❌ Admin user NOT found in production database!')
      console.log('\n🔧 Creating admin user...')
      
      const hashedPassword = await bcrypt.hash('Admin33#', 10)
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@vanityhub.com',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        }
      })
      
      console.log('✅ Admin user created!')
      console.log(`   ID: ${newAdmin.id}`)
      console.log(`   Email: ${newAdmin.email}`)
      console.log(`   Role: ${newAdmin.role}\n`)
    } else {
      console.log('✅ Admin user exists!')
      console.log(`   ID: ${admin.id}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Role: ${admin.role}`)
      console.log(`   Active: ${admin.isActive}\n`)
      
      // Test password
      const passwordMatch = await bcrypt.compare('Admin33#', admin.password)
      console.log(`🔐 Password test: ${passwordMatch ? '✅ CORRECT' : '❌ INCORRECT'}\n`)
      
      if (!passwordMatch) {
        console.log('🔧 Resetting password...')
        const newHash = await bcrypt.hash('Admin33#', 10)
        await prisma.user.update({
          where: { email: 'admin@vanityhub.com' },
          data: { password: newHash, isActive: true }
        })
        console.log('✅ Password reset to: Admin33#\n')
      }
    }
    
    // Count users
    const userCount = await prisma.user.count()
    console.log(`📊 Total users in database: ${userCount}\n`)
    
    console.log('🎉 Production database is ready!')
    console.log('\n📋 Login credentials:')
    console.log('   Email: admin@vanityhub.com')
    console.log('   Password: Admin33#')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProductionDB()
