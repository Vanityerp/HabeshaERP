import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllTransactions() {
  try {
    console.log('🔍 Checking all transactions in database...\n')

    const allTransactions = await prisma.transaction.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Get last 20 transactions
    })

    console.log(`📊 Total transactions in database: ${allTransactions.length}\n`)

    if (allTransactions.length > 0) {
      console.log('Recent transactions:')
      allTransactions.forEach(tx => {
        const metadata = tx.metadata as any
        console.log(`   - ${tx.type}: QAR ${Number(tx.amount).toFixed(2)} (${tx.status})`)
        console.log(`     Description: ${tx.description}`)
        console.log(`     User ID: ${tx.userId}`)
        console.log(`     Client Name: ${metadata?.clientName || 'N/A'}`)
        console.log(`     Created: ${tx.createdAt}`)
        console.log('')
      })
    } else {
      console.log('❌ No transactions found in database!')
    }

    // Check all clients
    const allClients = await prisma.client.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        totalSpent: true
      }
    })

    console.log(`\n📋 Total clients in database: ${allClients.length}\n`)
    allClients.forEach(client => {
      console.log(`   - ${client.name} (${client.email})`)
      console.log(`     Client ID: ${client.id}`)
      console.log(`     User ID: ${client.userId}`)
      console.log(`     Total Spent: QAR ${client.totalSpent || 0}`)
      console.log('')
    })

    console.log('✅ Check complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllTransactions()

