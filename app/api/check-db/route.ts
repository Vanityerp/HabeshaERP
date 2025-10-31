import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$connect()
    
    // Check admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@vanityhub.com' },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    })
    
    // Count total users
    const userCount = await prisma.user.count()
    
    // Get database info
    const databaseUrl = process.env.DATABASE_URL
    const dbInfo = databaseUrl 
      ? {
          type: databaseUrl.startsWith('postgres') ? 'PostgreSQL' : 'SQLite',
          host: databaseUrl.match(/@([^:\/]+)/)?.[1] || 'unknown',
        }
      : { type: 'unknown', host: 'unknown' }
    
    return NextResponse.json({
      status: 'success',
      database: {
        connected: true,
        ...dbInfo,
      },
      admin: adminUser ? {
        exists: true,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
        id: adminUser.id,
      } : {
        exists: false
      },
      stats: {
        totalUsers: userCount,
      },
      timestamp: new Date().toISOString(),
    })
    
  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
