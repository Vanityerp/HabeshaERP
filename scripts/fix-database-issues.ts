/**
 * Fix Database Issues Script
 * 
 * This script fixes common database issues:
 * 1. Ensures database schema is up to date
 * 2. Creates default admin user if none exists
 * 3. Creates default location if none exists
 * 4. Verifies critical tables exist
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Starting database fix...\n')

  try {
    // 1. Check if database is accessible
    console.log('1️⃣ Checking database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully\n')

    // 2. Check for users
    console.log('2️⃣ Checking for users...')
    const userCount = await prisma.user.count()
    console.log(`   Found ${userCount} users`)

    if (userCount === 0) {
      console.log('   Creating default admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@vanityhub.com',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date(),
        }
      })

      // Create staff profile for admin
      await prisma.staffMember.create({
        data: {
          userId: adminUser.id,
          name: 'Admin User',
          phone: '+97412345678',
          role: 'ADMIN',
          isActive: true,
        }
      })

      console.log('✅ Created admin user: admin@vanityhub.com / admin123\n')
    } else {
      console.log('✅ Users exist\n')
    }

    // 3. Check for locations
    console.log('3️⃣ Checking for locations...')
    const locationCount = await prisma.location.count()
    console.log(`   Found ${locationCount} locations`)

    if (locationCount === 0) {
      console.log('   Creating default location...')
      await prisma.location.create({
        data: {
          name: 'Main Branch',
          address: '123 Main Street, Doha, Qatar',
          phone: '+97412345678',
          isActive: true,
        }
      })
      console.log('✅ Created default location\n')
    } else {
      console.log('✅ Locations exist\n')
    }

    // 4. Check for services
    console.log('4️⃣ Checking for services...')
    const serviceCount = await prisma.service.count()
    console.log(`   Found ${serviceCount} services`)

    if (serviceCount === 0) {
      console.log('   Creating sample services...')
      
      const location = await prisma.location.findFirst()
      
      if (location) {
        const services = [
          {
            name: 'Haircut',
            description: 'Professional haircut service',
            duration: 30,
            price: 50,
            category: 'Hair Services',
          },
          {
            name: 'Hair Coloring',
            description: 'Full hair coloring service',
            duration: 90,
            price: 150,
            category: 'Hair Services',
          },
          {
            name: 'Manicure',
            description: 'Professional manicure',
            duration: 45,
            price: 40,
            category: 'Nail Services',
          },
          {
            name: 'Pedicure',
            description: 'Professional pedicure',
            duration: 60,
            price: 50,
            category: 'Nail Services',
          },
          {
            name: 'Facial Treatment',
            description: 'Relaxing facial treatment',
            duration: 60,
            price: 80,
            category: 'Facial Services',
          },
        ]

        for (const serviceData of services) {
          const service = await prisma.service.create({
            data: {
              ...serviceData,
              showPricesToClients: true,
              isActive: true,
            }
          })

          // Link service to location
          await prisma.locationService.create({
            data: {
              serviceId: service.id,
              locationId: location.id,
              price: serviceData.price,
              isActive: true,
            }
          })
        }

        console.log(`✅ Created ${services.length} sample services\n`)
      }
    } else {
      console.log('✅ Services exist\n')
    }

    // 5. Verify critical relationships
    console.log('5️⃣ Verifying relationships...')
    
    const servicesWithLocations = await prisma.service.findMany({
      include: {
        locations: true
      }
    })

    const servicesWithoutLocations = servicesWithLocations.filter(s => s.locations.length === 0)
    
    if (servicesWithoutLocations.length > 0) {
      console.log(`   Found ${servicesWithoutLocations.length} services without locations`)
      console.log('   Linking services to default location...')
      
      const defaultLocation = await prisma.location.findFirst()
      
      if (defaultLocation) {
        for (const service of servicesWithoutLocations) {
          await prisma.locationService.create({
            data: {
              serviceId: service.id,
              locationId: defaultLocation.id,
              price: service.price,
              isActive: true,
            }
          })
        }
        console.log('✅ Linked services to location\n')
      }
    } else {
      console.log('✅ All services have locations\n')
    }

    // 6. Summary
    console.log('📊 Database Summary:')
    console.log(`   Users: ${await prisma.user.count()}`)
    console.log(`   Staff: ${await prisma.staffMember.count()}`)
    console.log(`   Clients: ${await prisma.client.count()}`)
    console.log(`   Locations: ${await prisma.location.count()}`)
    console.log(`   Services: ${await prisma.service.count()}`)
    console.log(`   Appointments: ${await prisma.appointment.count()}`)
    console.log('')

    console.log('✅ Database fix completed successfully!')
    console.log('')
    console.log('🔐 Default Login Credentials:')
    console.log('   Email: admin@vanityhub.com')
    console.log('   Password: admin123')
    console.log('')

  } catch (error) {
    console.error('❌ Error fixing database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

