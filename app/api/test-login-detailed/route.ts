import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('🔍 Testing login for:', email)

    // Step 1: Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        step: 'USER_LOOKUP',
        message: 'User not found in database',
        email
      })
    }

    // Step 2: Check if user is active
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        step: 'USER_STATUS',
        message: 'User account is not active',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      })
    }

    // Step 3: Test password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        step: 'PASSWORD_VERIFICATION',
        message: 'Password does not match',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        },
        passwordHashPreview: user.password.substring(0, 20) + '...'
      })
    }

    // Step 4: All checks passed
    return NextResponse.json({
      success: true,
      message: 'All authentication checks passed!',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nextAuthConfigured: !!process.env.NEXTAUTH_SECRET
      }
    })

  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json({
      success: false,
      step: 'ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      error: String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send POST request with { email, password } to test login',
    example: {
      email: 'admin@vanityhub.com',
      password: 'Admin2024'
    }
  })
}
