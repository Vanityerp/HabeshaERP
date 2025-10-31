import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyTotalSpent() {
  try {
    console.log('🔍 Verifying total spent calculation...\n')

    // Get all clients
    const clients = await prisma.client.findMany({
      include: {
        user: true
      }
    })

    console.log(`Found ${clients.length} clients\n`)

    for (const client of clients) {
      // Get all completed transactions for this client
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: client.userId,
          status: 'COMPLETED'
        }
      })

      const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0)

      console.log(`📋 ${client.name}:`)
      console.log(`   User ID: ${client.userId}`)
      console.log(`   Transactions: ${transactions.length}`)
      console.log(`   Total Spent: QAR ${totalSpent.toFixed(2)}`)
      
      if (transactions.length > 0) {
        console.log(`   Transaction Details:`)
        transactions.forEach(t => {
          console.log(`      - ${t.type}: QAR ${Number(t.amount).toFixed(2)} (${t.status})`)
        })
      }
      console.log('')
    }

    console.log('✅ Verification complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyTotalSpent()

