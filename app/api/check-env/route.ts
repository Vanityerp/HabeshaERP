import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL?.substring(0, 50) + '...',
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL?.substring(0, 50) + '...',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    // Check which URL Prisma is actually trying to use
    prismaClientEngineType: 'Check if Data Proxy or Query Engine'
  })
}
