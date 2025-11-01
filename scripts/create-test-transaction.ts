import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestTransaction() {
  try {
    console.log('🔍 Creating test transaction for Luna...\n')

    // Find Luna
    const luna = await prisma.client.findFirst({
      where: {
        name: {
          contains: 'Luna',
          mode: 'insensitive'
        }
      }
    })

    if (!luna) {
      console.log('❌ Luna not found')
      return
    }

    console.log(`✅ Found Luna: ${luna.name} (UserID: ${luna.userId})`)

    // Create a test transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: luna.userId,
        amount: 150.00,
        type: 'SERVICE_SALE',
        status: 'COMPLETED',
        method: 'CASH',
        description: 'Test Service - Haircut',
        locationId: 'loc1', // Assuming this location exists
        serviceAmount: 150.00
      }
    })

    console.log(`✅ Created test transaction: ${transaction.id}`)
    console.log(`   Amount: QAR ${transaction.amount}`)
    console.log(`   Type: ${transaction.type}`)
    console.log(`   Status: ${transaction.status}`)

    // Verify it was created
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: luna.userId
      }
    })

    console.log(`\n📊 Total transactions for Luna: ${allTransactions.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestTransaction()

