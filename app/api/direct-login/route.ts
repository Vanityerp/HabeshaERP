import { NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/pg-auth'

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

    // Use raw PostgreSQL authentication
    const user = await authenticateUser(email, password)

    if (!user) {
      console.log('❌ Authentication failed')
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    console.log('✅ Authentication successful')

    // Get locations
    let locationIds: string[] = []
    if (user.staffProfile?.locations) {
      locationIds = user.staffProfile.locations
        .filter(sl => sl.location?.id)
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
      }
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
