import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validateAndSanitizeInput, userLoginSchema } from '@/lib/security/validation'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const email = body.email || process.env.ADMIN_EMAIL || 'admin@vanityhub.com'
    const password = body.password || process.env.ADMIN_PASSWORD || 'Admin33#'

    console.log('🧪 Testing admin login flow...')
    console.log(`📧 Email: ${email}`)

    // Step 1: Validate input (same as auth.ts)
    const validation = validateAndSanitizeInput(userLoginSchema, {
      email,
      password,
    })

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        step: 'validation',
        error: 'Input validation failed',
        errors: validation.errors,
      }, { status: 400 })
    }

    // Step 2: Find user (same as auth.ts)
    const user = await prisma.user.findUnique({
      where: { email: validation.data.email },
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
      return NextResponse.json({
        success: false,
        step: 'user_lookup',
        error: 'User not found',
        email: validation.data.email,
      }, { status: 404 })
    }

    // Step 3: Check if active
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        step: 'active_check',
        error: 'User account is inactive',
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
        }
      }, { status: 403 })
    }

    // Step 4: Compare password (same as auth.ts)
    const passwordMatch = await bcrypt.compare(validation.data.password, user.password)

    if (!passwordMatch) {
      // Also test with the raw password in case there's a hashing issue
      const rawMatch = validation.data.password === user.password
      
      return NextResponse.json({
        success: false,
        step: 'password_verification',
        error: 'Password does not match',
        passwordMatch,
        rawMatch,
        passwordHashPrefix: user.password.substring(0, 10),
        hint: rawMatch ? 'Password is stored in plain text!' : 'Password hash mismatch',
      }, { status: 401 })
    }

    // Step 5: Get locations (same as auth.ts)
    let locationIds: string[] = []
    if (user.staffProfile?.locations) {
      locationIds = user.staffProfile.locations
        .filter(sl => sl.isActive)
        .map(sl => sl.location.id)
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: 'Login flow test passed! ✅',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        name: user.staffProfile?.name || user.email.split('@')[0],
        locations: user.role === "ADMIN" ? ["all"] : locationIds,
      },
      staffProfile: user.staffProfile ? {
        id: user.staffProfile.id,
        name: user.staffProfile.name,
        status: user.staffProfile.status,
        locationCount: locationIds.length,
      } : null,
      steps: {
        validation: '✅ Passed',
        user_lookup: '✅ Found',
        active_check: '✅ Active',
        password_verification: '✅ Matched',
        location_lookup: `✅ ${locationIds.length} locations`,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ Error testing admin login:', error)
    return NextResponse.json({
      success: false,
      step: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to check current admin status
export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vanityhub.com'
    
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        staffProfile: {
          select: {
            id: true,
            name: true,
            status: true,
            locations: {
              select: {
                isActive: true,
                location: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: 'Admin user not found. Please run POST /api/ensure-admin to create one.',
      })
    }

    return NextResponse.json({
      exists: true,
      user,
      credentials: {
        email: adminEmail,
        password: '***check ADMIN_PASSWORD env var***',
      },
      instructions: 'Use POST /api/test-admin-login with credentials to test login flow',
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
