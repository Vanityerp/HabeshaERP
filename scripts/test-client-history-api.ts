import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testClientHistoryAPI() {
  try {
    console.log('🔍 Testing client history API logic...\n')

    // Find Luna
    const client = await prisma.client.findFirst({
      where: {
        name: {
          contains: 'Luna',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true
      }
    })

    if (!client) {
      console.log('❌ Luna not found')
      return
    }

    console.log(`✅ Found client: ${client.name} (ID: ${client.id}, UserID: ${client.userId})\n`)

    // Get appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: client.userId
      },
      include: {
        staff: true,
        location: true,
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

    console.log(`📅 Appointments: ${appointments.length}`)

    // Get transactions by userId
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: client.userId,
        type: {
          in: ['PRODUCT_SALE', 'SERVICE_SALE', 'PACKAGE_SALE', 'CONSOLIDATED_SALE']
        }
      },
      include: {
        location: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`💰 Transactions by userId: ${transactions.length}`)

    // Get transactions by name (fallback)
    const transactionsByName = await prisma.transaction.findMany({
      where: {
        description: { 
          contains: client.name, 
          mode: 'insensitive' 
        },
        type: {
          in: ['PRODUCT_SALE', 'SERVICE_SALE', 'PACKAGE_SALE', 'CONSOLIDATED_SALE']
        }
      },
      include: {
        location: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`💰 Transactions by name: ${transactionsByName.length}`)

    // Merge transactions
    const allTransactions = [...transactions]
    transactionsByName.forEach(tx => {
      if (!allTransactions.find(t => t.id === tx.id)) {
        allTransactions.push(tx)
      }
    })

    console.log(`📊 Total unique transactions: ${allTransactions.length}\n`)

    // Calculate totals
    const appointmentTotal = appointments.reduce((sum, apt) => sum + Number(apt.totalPrice), 0)
    const transactionTotal = allTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0)
    const grandTotal = appointmentTotal + transactionTotal

    console.log(`💵 Appointment Total: QAR ${appointmentTotal.toFixed(2)}`)
    console.log(`💵 Transaction Total: QAR ${transactionTotal.toFixed(2)}`)
    console.log(`💵 Grand Total: QAR ${grandTotal.toFixed(2)}`)

    console.log('\n✅ API logic test complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testClientHistoryAPI()

