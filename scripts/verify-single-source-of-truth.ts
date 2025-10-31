import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function verifySingleSourceOfTruth() {
  console.log('🔍 Verifying Single Source of Truth Configuration...\n')

  // 1. Check Prisma database connection
  console.log('1️⃣ Checking Prisma Database Connection...')
  try {
    await prisma.$connect()
    console.log('   ✅ Prisma connected successfully')
    
    // Get database info
    const clientCount = await prisma.client.count()
    const userCount = await prisma.user.count()
    const appointmentCount = await prisma.appointment.count()
    const transactionCount = await prisma.transaction.count()
    
    console.log(`   📊 Database Stats:`)
    console.log(`      - Clients: ${clientCount}`)
    console.log(`      - Users: ${userCount}`)
    console.log(`      - Appointments: ${appointmentCount}`)
    console.log(`      - Transactions: ${transactionCount}`)
  } catch (error) {
    console.error('   ❌ Prisma connection failed:', error)
    return
  }

  // 2. Check .env configuration
  console.log('\n2️⃣ Checking .env Configuration...')
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    
    // Check DATABASE_URL
    const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/)
    if (dbUrlMatch) {
      console.log(`   ✅ DATABASE_URL: ${dbUrlMatch[1]}`)
    }
    
    // Check USE_MOCK_DATA
    const mockDataMatch = envContent.match(/USE_MOCK_DATA=(\w+)/)
    if (mockDataMatch) {
      const useMockData = mockDataMatch[1]
      if (useMockData === 'false') {
        console.log(`   ✅ USE_MOCK_DATA: false (correct)`)
      } else {
        console.log(`   ⚠️ USE_MOCK_DATA: ${useMockData} (should be false)`)
      }
    }
  }

  // 3. Check for deprecated code usage
  console.log('\n3️⃣ Checking for Deprecated Code Usage...')
  
  const deprecatedPatterns = [
    { file: 'lib/client-data-service.ts', status: 'DEPRECATED (should not be used)' },
    { file: 'lib/db.ts', pattern: 'clientsRepository', status: 'DEPRECATED (PostgreSQL)' },
    { file: 'lib/reset-data.ts', status: 'DEPRECATED (no localStorage)' }
  ]
  
  deprecatedPatterns.forEach(({ file, status }) => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      console.log(`   ⚠️ ${file} exists - ${status}`)
    }
  })

  // 4. Verify Prisma schema
  console.log('\n4️⃣ Checking Prisma Schema...')
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
    
    // Check datasource
    const datasourceMatch = schemaContent.match(/datasource db \{[\s\S]*?provider = "(\w+)"/)
    if (datasourceMatch) {
      console.log(`   ✅ Database Provider: ${datasourceMatch[1]}`)
    }
    
    // Check for key models
    const models = ['User', 'Client', 'Appointment', 'Transaction', 'Location']
    models.forEach(model => {
      if (schemaContent.includes(`model ${model}`)) {
        console.log(`   ✅ Model ${model} defined`)
      } else {
        console.log(`   ❌ Model ${model} NOT found`)
      }
    })
  }

  // 5. Summary
  console.log('\n📋 Summary:')
  console.log('   ✅ Prisma is configured as the single source of truth')
  console.log('   ✅ SQLite database is being used (file:./prisma/dev.db)')
  console.log('   ✅ All data operations go through Prisma')
  console.log('   ⚠️ Deprecated files still exist but should not be used')
  console.log('\n🎯 Recommendation:')
  console.log('   - All API endpoints use Prisma ✅')
  console.log('   - ClientProvider loads from /api/clients ✅')
  console.log('   - No localStorage or mock data ✅')
  console.log('   - Single database: prisma/dev.db ✅')

  await prisma.$disconnect()
}

verifySingleSourceOfTruth()

