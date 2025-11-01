import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-client'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email?.toLowerCase().trim()
    const password = body.password

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password required'
      }, { status: 400 })
    }

    console.log('Direct login attempt for:', email)

    // Find user WITHOUT any validation layer
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        staffProfile: {
          include: {
            locations: {
              include: {
                location: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password',
        debug: { step: 'user_lookup', found: false }
      }, { status: 401 })
    }

    if (!user.isActive) {
      console.log('❌ User not active')
      return NextResponse.json({
        success: false,
        error: 'Account is not active',
        debug: { step: 'user_status', active: false }
      }, { status: 401 })
    }

    // Direct password comparison
    const passwordMatch = await bcrypt.compare(password, user.password)
    
    console.log('Password match result:', passwordMatch)

    if (!passwordMatch) {
      console.log('❌ Password mismatch')
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password',
        debug: { 
          step: 'password_check', 
          match: false,
          hashPreview: user.password.substring(0, 20) + '...'
        }
      }, { status: 401 })
    }

    console.log('✅ Authentication successful')

    // Get locations
    let locationIds: string[] = []
    if (user.staffProfile?.locations) {
      locationIds = user.staffProfile.locations
        .filter(sl => sl.isActive)
        .map(sl => sl.location.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.staffProfile?.name || user.email.split('@')[0],
        locations: user.role === 'ADMIN' ? ['all'] : locationIds
      },
      instructions: 'Use NextAuth signIn with these credentials'
    })

  } catch (error) {
    console.error('Direct login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Authentication failed',
      debug: { error: String(error) }
    }, { status: 500 })
  }
}
