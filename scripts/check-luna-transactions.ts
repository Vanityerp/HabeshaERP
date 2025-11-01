import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLunaTransactions() {
  try {
    console.log('🔍 Checking Luna Taylor transactions...\n')

    // Find Luna in the Client table
    const lunaClient = await prisma.client.findFirst({
      where: {
        name: {
          contains: 'Luna',
          mode: 'insensitive'
        }
      }
    })

    if (!lunaClient) {
      console.log('❌ Luna not found in Client table')
      return
    }

    console.log('✅ Found Luna in Client table:')
    console.log(`   Client ID: ${lunaClient.id}`)
    console.log(`   User ID: ${lunaClient.userId}`)
    console.log(`   Name: ${lunaClient.name}`)
    console.log(`   Email: ${lunaClient.email}`)
    console.log(`   Phone: ${lunaClient.phone}`)
    console.log(`   Total Spent (stored): QAR ${lunaClient.totalSpent || 0}\n`)

    // Find transactions by userId
    const transactionsByUserId = await prisma.transaction.findMany({
      where: {
        userId: lunaClient.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Transactions by userId (${lunaClient.userId}): ${transactionsByUserId.length}`)
    if (transactionsByUserId.length > 0) {
      let total = 0
      transactionsByUserId.forEach(tx => {
        console.log(`   - ${tx.type}: QAR ${Number(tx.amount).toFixed(2)} (${tx.status}) - ${tx.description}`)
        if (tx.status === 'COMPLETED') {
          total += Number(tx.amount)
        }
      })
      console.log(`   Total (COMPLETED): QAR ${total.toFixed(2)}\n`)
    } else {
      console.log('   No transactions found by userId\n')
    }

    // Find transactions by client name in description
    const transactionsByName = await prisma.transaction.findMany({
      where: {
        description: { contains: 'Luna', mode: 'insensitive' }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Transactions by name in description (Luna): ${transactionsByName.length}`)
    if (transactionsByName.length > 0) {
      let total = 0
      transactionsByName.forEach(tx => {
        console.log(`   - ${tx.type}: QAR ${Number(tx.amount).toFixed(2)} (${tx.status}) - ${tx.description} - userId: ${tx.userId}`)
        if (tx.status === 'COMPLETED') {
          total += Number(tx.amount)
        }
      })
      console.log(`   Total (COMPLETED): QAR ${total.toFixed(2)}\n`)
    } else {
      console.log('   No transactions found by name\n')
    }

    // Find appointments by userId
    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: lunaClient.userId
      },
      include: {
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    console.log(`📅 Appointments by userId: ${appointments.length}`)
    if (appointments.length > 0) {
      let total = 0
      appointments.forEach(apt => {
        const services = apt.services.map(s => s.service.name).join(', ')
        console.log(`   - ${services}: QAR ${Number(apt.totalPrice).toFixed(2)} (${apt.status})`)
        if (apt.status === 'COMPLETED') {
          total += Number(apt.totalPrice)
        }
      })
      console.log(`   Total (COMPLETED): QAR ${total.toFixed(2)}\n`)
    } else {
      console.log('   No appointments found\n')
    }

    // Check all transactions to see if any match Luna's phone or email
    console.log('🔍 Checking all transactions for potential matches...')
    const allTransactions = await prisma.transaction.findMany({
      where: {
        type: {
          in: ['PRODUCT_SALE', 'SERVICE_SALE', 'PACKAGE_SALE', 'CONSOLIDATED_SALE']
        }
      }
    })

    const potentialMatches = allTransactions.filter(tx => {
      const metadata = tx.metadata as any
      return (
        metadata?.clientName?.toLowerCase().includes('luna') ||
        metadata?.phone === lunaClient.phone ||
        metadata?.email === lunaClient.email ||
        tx.description?.toLowerCase().includes('luna')
      )
    })

    console.log(`📊 Potential matches in all transactions: ${potentialMatches.length}`)
    if (potentialMatches.length > 0) {
      let total = 0
      potentialMatches.forEach(tx => {
        const metadata = tx.metadata as any
        console.log(`   - ${tx.type}: QAR ${Number(tx.amount).toFixed(2)} (${tx.status}) - userId: ${tx.userId} - clientName: ${metadata?.clientName}`)
        if (tx.status === 'COMPLETED') {
          total += Number(tx.amount)
        }
      })
      console.log(`   Total (COMPLETED): QAR ${total.toFixed(2)}\n`)
    }

    console.log('✅ Check complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLunaTransactions()

