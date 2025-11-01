import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with connection pooling and retry logic
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
})

// Helper function to get database URL from environment variables
function getDatabaseUrl(): string | undefined {
  const databaseUrl = process.env.DATABASE_URL
  
  // Handle Vercel environment variable format
  if (databaseUrl && databaseUrl.startsWith('{')) {
    try {
      const parsed = JSON.parse(databaseUrl)
      return parsed.url
    } catch (e) {
      console.error('Failed to parse DATABASE_URL as JSON:', e)
      return undefined
    }
  }
  
  return databaseUrl
}

// Store the Prisma client in the global object to prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown - disconnect on process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}


