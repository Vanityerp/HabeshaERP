import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with connection pooling and retry logic
// In production, DATABASE_URL must be available at runtime
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('❌ CRITICAL: DATABASE_URL is not set in production environment')
}

// Fix for Vercel Postgres connection with prisma:// protocol
let databaseUrl = process.env.DATABASE_URL || '';
if (databaseUrl.startsWith('prisma://')) {
  // Use DIRECT_URL if available for direct connections
  databaseUrl = process.env.DIRECT_URL || databaseUrl;
  console.log('Using direct database connection for Prisma');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  // Add connection pool configuration
  transactionOptions: {
    maxWait: 10000, // 10 seconds max wait for a connection
    timeout: 30000, // 30 seconds transaction timeout
  },
})

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
