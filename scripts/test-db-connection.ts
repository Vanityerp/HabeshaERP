import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test connection by querying for users
    const users = await prisma.user.findMany({
      take: 1
    })
    
    console.log('✅ Database connection successful!')
    console.log(`📊 Found ${users.length} users in the database`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()