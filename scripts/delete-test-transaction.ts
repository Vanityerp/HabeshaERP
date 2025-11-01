import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteTestTransaction() {
  try {
    console.log('🗑️ Deleting test transaction...\n')

    const result = await prisma.transaction.deleteMany({
      where: {
        description: 'Test Service - Haircut'
      }
    })

    console.log(`✅ Deleted ${result.count} test transaction(s)`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTestTransaction()

