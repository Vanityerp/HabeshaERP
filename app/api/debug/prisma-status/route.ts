import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const diagnostics: Record<string, any> = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? "SET (hidden)" : "NOT SET",
      prismaVersion: "5.20.0",
    }

    // Test database connection
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`
      diagnostics.databaseConnection = "SUCCESS"
      diagnostics.queryTest = result
    } catch (dbError: any) {
      diagnostics.databaseConnection = "FAILED"
      diagnostics.databaseError = {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta
      }
    }

    // Test location count
    try {
      const locationCount = await prisma.location.count()
      diagnostics.locationCount = locationCount
    } catch (locError: any) {
      diagnostics.locationCountError = {
        message: locError.message,
        code: locError.code
      }
    }

    // Test service count
    try {
      const serviceCount = await prisma.service.count()
      diagnostics.serviceCount = serviceCount
    } catch (svcError: any) {
      diagnostics.serviceCountError = {
        message: svcError.message,
        code: svcError.code
      }
    }

    // Test staff count
    try {
      const staffCount = await prisma.staffMember.count()
      diagnostics.staffCount = staffCount
    } catch (staffError: any) {
      diagnostics.staffCountError = {
        message: staffError.message,
        code: staffError.code
      }
    }

    return NextResponse.json(diagnostics, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({
      error: "Diagnostic failed",
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
