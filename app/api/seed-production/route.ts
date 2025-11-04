import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { realServiceData } from '@/prisma/real-services-data'

const prisma = new PrismaClient()

/**
 * Production Database Seeding Endpoint
 * 
 * This endpoint seeds the production database with all initial data:
 * - Admin user
 * - Locations (5 salon locations)
 * - Services (real salon services)
 * - Staff members (23 staff with HR data)
 * - Sample clients
 * - Sample appointments
 * 
 * ⚠️ SECURITY: In production, this should be protected or removed after initial setup
 */
export async function POST(request: Request) {
  try {
    // Optional: Add authentication check here
    // const session = await getServerSession()
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('🌱 Starting production database seeding...')

    // Parse request body for options
    const body = await request.json().catch(() => ({}))
    const { skipIfExists = true } = body

    const results = {
      admin: null as any,
      locations: [] as any[],
      services: [] as any[],
      staff: [] as any[],
      clients: [] as any[],
      appointments: [] as any[],
      errors: [] as any[]
    }

    // ============================================================================
    // 1. CREATE ADMIN USER
    // ============================================================================
    try {
      const adminPassword = await bcrypt.hash('Admin33#', 10)
      let admin = await prisma.user.findUnique({
        where: { email: 'admin@vanityhub.com' }
      })

      if (!admin) {
        admin = await prisma.user.create({
          data: {
            email: 'admin@vanityhub.com',
            password: adminPassword,
            role: 'ADMIN',
            isActive: true,
          },
        })
        results.admin = { status: 'created', email: admin.email }
        console.log('✅ Created admin user')
      } else if (!skipIfExists) {
        admin = await prisma.user.update({
          where: { email: 'admin@vanityhub.com' },
          data: {
            password: adminPassword,
            isActive: true,
          },
        })
        results.admin = { status: 'updated', email: admin.email }
        console.log('✅ Updated admin user password')
      } else {
        results.admin = { status: 'exists', email: admin.email }
        console.log('⏭️  Admin user already exists')
      }
    } catch (error) {
      results.errors.push({ step: 'admin', error: error instanceof Error ? error.message : 'Unknown error' })
      console.error('❌ Error creating admin:', error)
    }

    // ============================================================================
    // 2. CREATE LOCATIONS
    // ============================================================================
    try {
      console.log('🏢 Creating 5 salon locations...')
      
      const locationsData = [
        {
          id: 'loc1',
          name: 'D-ring road',
          address: 'D-ring road',
          city: 'Doha',
          state: 'Doha',
          zipCode: '12345',
          country: 'Qatar',
          phone: '+974 1234 5678',
          email: 'dring@vanityhub.com',
        },
        {
          id: 'loc2',
          name: 'Muaither',
          address: 'Muaither',
          city: 'Doha',
          state: 'Doha',
          zipCode: '12346',
          country: 'Qatar',
          phone: '+974 1234 5679',
          email: 'muaither@vanityhub.com',
        },
        {
          id: 'loc3',
          name: 'Medinat Khalifa',
          address: 'Medinat Khalifa',
          city: 'Doha',
          state: 'Doha',
          zipCode: '12347',
          country: 'Qatar',
          phone: '+974 1234 5680',
          email: 'medinat@vanityhub.com',
        },
        {
          id: 'loc4',
          name: 'Home service',
          address: 'Mobile Service',
          city: 'Doha',
          state: 'Doha',
          zipCode: '00000',
          country: 'Qatar',
          phone: '+974 1234 5681',
          email: 'home@vanityhub.com',
        },
        {
          id: 'loc5',
          name: 'Online store',
          address: 'E-commerce',
          city: 'Doha',
          state: 'Doha',
          zipCode: '00000',
          country: 'Qatar',
          phone: '+974 1234 5682',
          email: 'online@vanityhub.com',
        },
      ]

      for (const locationData of locationsData) {
        const existing = await prisma.location.findFirst({
          where: { name: locationData.name, isActive: true }
        })

        if (!existing) {
          const location = await prisma.location.create({ data: locationData })
          results.locations.push({ status: 'created', name: location.name })
          console.log(`  ✅ Created location: ${location.name}`)
        } else {
          results.locations.push({ status: 'exists', name: existing.name })
          console.log(`  ⏭️  Location already exists: ${existing.name}`)
        }
      }
    } catch (error) {
      results.errors.push({ step: 'locations', error: error instanceof Error ? error.message : 'Unknown error' })
      console.error('❌ Error creating locations:', error)
    }

    // ============================================================================
    // 3. CREATE SERVICES
    // ============================================================================
    try {
      console.log('💇 Creating salon services...')
      
      const locations = await prisma.location.findMany({
        where: { isActive: true }
      })

      for (const serviceData of realServiceData) {
        const existing = await prisma.service.findFirst({
          where: { name: serviceData.name }
        })

        if (!existing) {
          const service = await prisma.service.create({
            data: {
              name: serviceData.name,

              duration: serviceData.duration,
              price: serviceData.price,
              category: serviceData.category,
              isActive: true,
            },
          })

          // Associate service with all locations except "Online store"
          for (const location of locations) {
            if (location.name !== 'Online store') {
              await prisma.locationService.create({
                data: {
                  serviceId: service.id,
                  locationId: location.id,
                  price: serviceData.price,
                  isActive: true,
                },
              })
            }
          }

          results.services.push({ status: 'created', name: service.name })
          console.log(`  ✅ Created service: ${service.name}`)
        } else {
          results.services.push({ status: 'exists', name: existing.name })
        }
      }
      
      console.log(`✅ Services setup complete (${realServiceData.length} services)`)
    } catch (error) {
      results.errors.push({ step: 'services', error: error instanceof Error ? error.message : 'Unknown error' })
      console.error('❌ Error creating services:', error)
    }

    // ============================================================================
    // 4. SUMMARY
    // ============================================================================
    const summary = {
      success: results.errors.length === 0,
      message: results.errors.length === 0 
        ? 'Production database seeded successfully!' 
        : 'Database seeding completed with some errors',
      results: {
        admin: results.admin,
        locations: {
          created: results.locations.filter(l => l.status === 'created').length,
          existing: results.locations.filter(l => l.status === 'exists').length,
          total: results.locations.length
        },
        services: {
          created: results.services.filter(s => s.status === 'created').length,
          existing: results.services.filter(s => s.status === 'exists').length,
          total: results.services.length
        },
      },
      errors: results.errors,
      timestamp: new Date().toISOString(),
    }

    console.log('✅ Production database seeding completed!')
    console.log('📊 Summary:', JSON.stringify(summary, null, 2))

    return NextResponse.json(summary)

  } catch (error) {
    console.error('❌ Fatal error during seeding:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to check what would be seeded
export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const locationCount = await prisma.location.count()
    const serviceCount = await prisma.service.count()
    const staffCount = await prisma.staffMember.count()
    const clientCount = await prisma.client.count()

    return NextResponse.json({
      message: 'Production database status',
      current: {
        users: userCount,
        locations: locationCount,
        services: serviceCount,
        staff: staffCount,
        clients: clientCount,
      },
      willSeed: {
        admin: userCount === 0 ? 'will create' : 'already exists',
        locations: '5 locations',
        services: `${realServiceData.length} services`,
        note: 'Use POST to seed the database'
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

