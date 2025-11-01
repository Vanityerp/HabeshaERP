import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    console.log('🧪 Testing authentication for:', email)
    
    // Test database connection
    await prisma.$connect()
    
    // Find user
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
      return NextResponse.json({ 
        success: false, 
        message: 'User not found',
        userExists: false
      })
    }
    
    // Test password
    const passwordMatch = await bcrypt.compare(password, user.password)
    
    return NextResponse.json({ 
      success: true,
      message: 'Authentication test completed',
      userExists: true,
      passwordMatch,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    })
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
