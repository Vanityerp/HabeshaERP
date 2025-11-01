import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextAuthConfigured: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT_SET',
      databaseConfigured: !!process.env.DATABASE_URL,
      databaseConnection: false,
      adminUserExists: false,
      adminUserActive: false,
      canHashPasswords: false
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      diagnostics.databaseConnection = true
    } catch (error) {
      console.error('Database connection failed:', error)
    }

    // Check admin user
    try {
      const admin = await prisma.user.findUnique({
        where: { email: 'admin@vanityhub.com' }
      })
      
      if (admin) {
        diagnostics.adminUserExists = true
        diagnostics.adminUserActive = admin.isActive
      }
    } catch (error) {
      console.error('Admin user check failed:', error)
    }

    // Test bcrypt
    try {
      const testHash = await bcrypt.hash('test', 12)
      const testCompare = await bcrypt.compare('test', testHash)
      diagnostics.canHashPasswords = testCompare
    } catch (error) {
      console.error('Bcrypt test failed:', error)
    }

    return NextResponse.json({
      success: true,
      diagnostics
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
