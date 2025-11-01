import { NextResponse } from 'next/server'

/**
 * Debug endpoint to check environment variables
 * This helps diagnose database connection issues
 */
export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL
    const directUrl = process.env.DIRECT_URL
    const nextAuthUrl = process.env.NEXTAUTH_URL
    const nextAuthSecret = process.env.NEXTAUTH_SECRET
    const nodeEnv = process.env.NODE_ENV

    // Mask sensitive parts of URLs
    const maskUrl = (url: string | undefined) => {
      if (!url) return 'NOT SET'
      
      // Extract protocol and host
      try {
        const urlObj = new URL(url)
        const protocol = urlObj.protocol
        const host = urlObj.host
        const pathname = urlObj.pathname
        
        // Mask password
        const maskedUrl = url.replace(/:[^:@]+@/, ':***@')
        
        return {
          protocol,
          host,
          pathname,
          full: maskedUrl.substring(0, 80) + '...',
          length: url.length,
          hasPassword: url.includes('@'),
          hasSSL: url.includes('sslmode') || url.includes('ssl=true'),
        }
      } catch (e) {
        return {
          error: 'Invalid URL format',
          preview: url.substring(0, 20) + '...',
          length: url.length
        }
      }
    }

    return NextResponse.json({
      environment: {
        NODE_ENV: nodeEnv,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
      },
      database: {
        DATABASE_URL: maskUrl(databaseUrl),
        DIRECT_URL: maskUrl(directUrl),
      },
      auth: {
        NEXTAUTH_URL: nextAuthUrl,
        NEXTAUTH_SECRET: nextAuthSecret ? 'SET (length: ' + nextAuthSecret.length + ')' : 'NOT SET',
      },
      prisma: {
        clientVersion: 'Check if Prisma client is generated',
        engineType: 'Should be Query Engine, not Data Proxy',
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}

