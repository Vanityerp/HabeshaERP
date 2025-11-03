import { PrismaClient } from '@prisma/client'

// Force use of direct database connection, not Data Proxy
const DATABASE_URL = process.env.DATABASE_URL

// Only validate during runtime, not during build
if (process.env.NODE_ENV !== 'production' && !DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL environment variable is not set')
}

// Validate URL format - must NOT be a Data Proxy URL (if set)
if (DATABASE_URL && DATABASE_URL.startsWith('prisma://')) {
  throw new Error('ERROR: DATABASE_URL is set to Data Proxy format. Use direct PostgreSQL connection URL instead.')
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with explicit connection string
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  ...(DATABASE_URL && {
    datasources: {
      db: {
        url: DATABASE_URL
      }
    },
  }),
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// Store the Prisma client in the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
