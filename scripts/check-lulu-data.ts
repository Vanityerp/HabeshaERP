import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLuluData() {
  try {
    console.log('🔍 Searching for Lulu in the database...\n')

    // Find Lulu by name
    const clients = await prisma.client.findMany({
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

    console.log(`Found ${clients.length} client(s) matching "Lulu":\n`)
    
    for (const client of clients) {
      console.log(`📋 Client: ${client.name}`)
      console.log(`   ID: ${client.id}`)
      console.log(`   User ID: ${client.userId}`)
      console.log(`   Email: ${client.email}`)
      console.log(`   Phone: ${client.phone}`)
      console.log(`   Preferred Location: ${client.preferredLocation?.name || 'None'}`)
      console.log('')

      // Find appointments for this client
      const appointments = await prisma.appointment.findMany({
        where: {
          clientId: client.id
        },
        include: {
          staff: true,
          location: true,
          services: {
            include: {
              service: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })

      console.log(`   📅 Appointments: ${appointments.length}`)
      for (const apt of appointments) {
        console.log(`      - ${apt.bookingReference}: ${apt.services.map(s => s.service.name).join(', ')}`)
        console.log(`        Date: ${apt.date}`)
        console.log(`        Status: ${apt.status}`)
        console.log(`        Total: ${apt.totalPrice}`)
        console.log(`        Staff: ${apt.staff.name}`)
        console.log(`        Location: ${apt.location.name}`)
      }
      console.log('')

      // Find transactions for this client's user
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: client.userId
        },
        include: {
          location: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      console.log(`   💰 Transactions: ${transactions.length}`)
      for (const txn of transactions) {
        console.log(`      - ${txn.id}: ${txn.description || 'No description'}`)
        console.log(`        Type: ${txn.type}`)
        console.log(`        Amount: ${txn.amount}`)
        console.log(`        Method: ${txn.method}`)
        console.log(`        Status: ${txn.status}`)
        console.log(`        Date: ${txn.createdAt}`)
        if (txn.items) {
          console.log(`        Items: ${txn.items}`)
        }
      }
      console.log('')
    }

    // Also check by booking reference
    console.log('🔍 Searching for appointment WI-143176...\n')
    const appointment = await prisma.appointment.findFirst({
      where: {
        bookingReference: 'WI-143176'
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

    if (appointment) {
      console.log('✅ Found appointment:')
      console.log(`   Booking Reference: ${appointment.bookingReference}`)
      console.log(`   Client: ${appointment.client.name} (ID: ${appointment.clientId})`)
      console.log(`   Date: ${appointment.date}`)
      console.log(`   Status: ${appointment.status}`)
      console.log(`   Services: ${appointment.services.map(s => s.service.name).join(', ')}`)
      console.log(`   Total Price: ${appointment.totalPrice}`)
      console.log(`   Staff: ${appointment.staff.name}`)
      console.log(`   Location: ${appointment.location.name}`)
      console.log('')
    } else {
      console.log('❌ Appointment WI-143176 not found in database')
      console.log('')
    }

    // Check all appointments in the database
    console.log('🔍 Checking all appointments in database...\n')
    const allAppointments = await prisma.appointment.findMany({
      include: {
        client: true,
        staff: true,
        location: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
    })

    console.log(`Total appointments in database: ${allAppointments.length}`)
    for (const apt of allAppointments) {
      console.log(`   - ${apt.bookingReference}: ${apt.client.name} - ${apt.status}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLuluData()

