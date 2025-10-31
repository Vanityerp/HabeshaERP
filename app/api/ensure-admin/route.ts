import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    // Parse request body for optional custom credentials
    const body = await request.json().catch(() => ({}))
    
    const adminEmail = body.email || process.env.ADMIN_EMAIL || 'admin@vanityhub.com'
    const adminPassword = body.password || process.env.ADMIN_PASSWORD || 'Admin33#'

    console.log('🔐 Ensuring admin user exists...')
    console.log(`📧 Email: ${adminEmail}`)

    // Check database connection
    await prisma.$connect()
    console.log('✅ Database connected')

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    console.log('✅ Password hashed')

    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
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

    let user
    if (existingAdmin) {
      // Update existing admin user
      user = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
        include: {
          staffProfile: true
        }
      })
      console.log('✅ Updated existing admin user')
    } else {
      // Create new admin user
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      })
      console.log('✅ Created new admin user')
    }

    // Verify the password works
    const passwordVerification = await bcrypt.compare(adminPassword, user.password)
    console.log(`🔐 Password verification: ${passwordVerification ? 'SUCCESS' : 'FAILED'}`)

    return NextResponse.json({
      success: true,
      message: existingAdmin ? 'Admin user updated successfully' : 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        hasStaffProfile: !!existingAdmin?.staffProfile,
      },
      passwordVerification,
      credentials: {
        email: adminEmail,
        // Only show password in development
        password: process.env.NODE_ENV === 'production' ? '***hidden***' : adminPassword,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ Error ensuring admin user:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to check admin status without modifying
export async function GET() {
  try {
    await prisma.$connect()
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vanityhub.com'
    
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        staffProfile: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        }
      }
    })
    
    return NextResponse.json({
      exists: !!adminUser,
      user: adminUser || null,
      timestamp: new Date().toISOString(),
    })
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
