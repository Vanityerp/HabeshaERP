import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addLuluAppointment() {
  try {
    console.log('🔍 Finding Lulu in the database...\n')

    // Find Lulu
    const lulu = await prisma.client.findFirst({
      where: {
        name: {
          contains: 'Lulu'
        }
      },
      include: {
        user: true,
        preferredLocation: true
      }
    })

    if (!lulu) {
      console.error('❌ Lulu not found in database')
      return
    }

    console.log(`✅ Found Lulu: ${lulu.name} (ID: ${lulu.id})`)
    console.log(`   User ID: ${lulu.userId}`)
    console.log(`   Email: ${lulu.email}`)
    console.log(`   Phone: ${lulu.phone}`)
    console.log('')

    // Find the service "Flat Iron (Extra Long)"
    const service = await prisma.service.findFirst({
      where: {
        name: {
          contains: 'Flat Iron'
        }
      }
    })

    if (!service) {
      console.error('❌ Service "Flat Iron (Extra Long)" not found')
      return
    }

    console.log(`✅ Found service: ${service.name} (ID: ${service.id})`)
    console.log(`   Price: ${service.price}`)
    console.log(`   Duration: ${service.duration} minutes`)
    console.log('')

    // Find staff "Priya Sharma (Barber)"
    const staff = await prisma.staffMember.findFirst({
      where: {
        name: {
          contains: 'Priya'
        }
      }
    })

    if (!staff) {
      console.error('❌ Staff "Priya Sharma" not found')
      return
    }

    console.log(`✅ Found staff: ${staff.name} (ID: ${staff.id})`)
    console.log('')

    // Find location (use Lulu's preferred location or first available)
    const location = lulu.preferredLocation || await prisma.location.findFirst()

    if (!location) {
      console.error('❌ No location found')
      return
    }

    console.log(`✅ Using location: ${location.name} (ID: ${location.id})`)
    console.log('')

    // Create the appointment
    console.log('💾 Creating appointment...')
    
    const appointmentDate = new Date('2025-10-31T13:45:00') // Oct 31, 2025, 13:45
    
    const appointment = await prisma.appointment.create({
      data: {
        bookingReference: 'WI-143176',
        clientId: lulu.userId, // Use userId, not client.id
        staffId: staff.id,
        locationId: location.id,
        date: appointmentDate,
        duration: 60, // 1 hour
        totalPrice: 550.00, // QAR 200 (service) + QAR 350 (product)
        status: 'COMPLETED',
        notes: 'Completed appointment with service and product purchase',
        services: {
          create: [{
            serviceId: service.id,
            price: 200.00, // QAR 200 for Flat Iron (Extra Long)
            duration: 60
          }]
        }
      },
      include: {
        client: true,
        staff: true,
        location: true,
        services: {
          include: {
            service: true
          }
        }
      }
    })

    console.log('✅ Appointment created successfully!')
    console.log(`   ID: ${appointment.id}`)
    console.log(`   Booking Reference: ${appointment.bookingReference}`)
    console.log(`   Date: ${appointment.date}`)
    console.log(`   Status: ${appointment.status}`)
    console.log(`   Total Price: QAR ${appointment.totalPrice}`)
    console.log('')

    // Create transaction for the service
    console.log('💾 Creating service transaction...')
    
    const serviceTransaction = await prisma.transaction.create({
      data: {
        userId: lulu.userId,
        amount: 200.00,
        type: 'SERVICE_SALE',
        status: 'COMPLETED',
        method: 'CREDIT_CARD',
        description: 'Flat Iron (Extra Long)',
        locationId: location.id,
        appointmentId: appointment.id,
        serviceAmount: 200.00,
        items: JSON.stringify([
          {
            name: 'Flat Iron (Extra Long)',
            quantity: 1,
            price: 200.00
          }
        ])
      }
    })

    console.log('✅ Service transaction created!')
    console.log(`   ID: ${serviceTransaction.id}`)
    console.log(`   Amount: QAR ${serviceTransaction.amount}`)
    console.log(`   Type: ${serviceTransaction.type}`)
    console.log('')

    // Create transaction for the product
    console.log('💾 Creating product transaction...')
    
    const productTransaction = await prisma.transaction.create({
      data: {
        userId: lulu.userId,
        amount: 350.00,
        type: 'PRODUCT_SALE',
        status: 'COMPLETED',
        method: 'CREDIT_CARD',
        description: '1x Tape-in Extensions - 20 inch',
        locationId: location.id,
        productAmount: 350.00,
        items: JSON.stringify([
          {
            name: 'Tape-in Extensions - 20 inch',
            quantity: 1,
            price: 350.00
          }
        ])
      }
    })

    console.log('✅ Product transaction created!')
    console.log(`   ID: ${productTransaction.id}`)
    console.log(`   Amount: QAR ${productTransaction.amount}`)
    console.log(`   Type: ${productTransaction.type}`)
    console.log('')

    console.log('🎉 All data created successfully!')
    console.log('')
    console.log('📊 Summary:')
    console.log(`   Client: ${lulu.name}`)
    console.log(`   Appointment: ${appointment.bookingReference}`)
    console.log(`   Service: ${service.name} - QAR 200.00`)
    console.log(`   Product: Tape-in Extensions - 20 inch - QAR 350.00`)
    console.log(`   Total: QAR 550.00`)
    console.log(`   Payment: Paid via Credit Card`)
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addLuluAppointment()

