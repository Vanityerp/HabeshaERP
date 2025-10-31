import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestTransactions() {
  try {
    console.log('🔍 Adding test transactions for clients...\n')

    // Find Emma Wilson
    const emma = await prisma.client.findFirst({
      where: {
        name: {
          contains: 'Emma'
        }
      }
    })

    if (emma) {
      console.log(`✅ Found Emma Wilson (User ID: ${emma.userId})`)
      
      // Add some transactions for Emma
      await prisma.transaction.create({
        data: {
          userId: emma.userId,
          amount: 450.00,
          type: 'SERVICE_SALE',
          status: 'COMPLETED',
          method: 'CREDIT_CARD',
          description: 'Hair Coloring Service',
          items: JSON.stringify([
            { name: 'Hair Coloring', quantity: 1, price: 450.00 }
          ])
        }
      })
      console.log('   ✅ Added transaction: QAR 450.00 (Hair Coloring)')

      await prisma.transaction.create({
        data: {
          userId: emma.userId,
          amount: 120.00,
          type: 'PRODUCT_SALE',
          status: 'COMPLETED',
          method: 'CASH',
          description: 'Hair Care Products',
          items: JSON.stringify([
            { name: 'Shampoo', quantity: 1, price: 60.00 },
            { name: 'Conditioner', quantity: 1, price: 60.00 }
          ])
        }
      })
      console.log('   ✅ Added transaction: QAR 120.00 (Hair Care Products)')
      console.log(`   💰 Emma's Total: QAR 570.00\n`)
    }

    // Find Fatima Al-Rashid
    const fatima = await prisma.client.findFirst({
      where: {
        name: {
          contains: 'Fatima'
        }
      }
    })

    if (fatima) {
      console.log(`✅ Found Fatima Al-Rashid (User ID: ${fatima.userId})`)
      
      // Add some transactions for Fatima
      await prisma.transaction.create({
        data: {
          userId: fatima.userId,
          amount: 240.00,
          type: 'SERVICE_SALE',
          status: 'COMPLETED',
          method: 'CREDIT_CARD',
          description: 'Manicure & Pedicure',
          items: JSON.stringify([
            { name: 'Manicure', quantity: 1, price: 120.00 },
            { name: 'Pedicure', quantity: 1, price: 120.00 }
          ])
        }
      })
      console.log('   ✅ Added transaction: QAR 240.00 (Manicure & Pedicure)')
      console.log(`   💰 Fatima's Total: QAR 240.00\n`)
    }

    console.log('🎉 Test transactions added successfully!')
    console.log('\n📊 Summary:')
    console.log('   Emma Wilson: QAR 570.00')
    console.log('   Fatima Al-Rashid: QAR 240.00')
    console.log('   Lulu: QAR 550.00 (already exists)')
    console.log('   Maria: QAR 0.00')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestTransactions()

