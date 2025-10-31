import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { realServiceData } from './real-services-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user (or get existing one)
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
    console.log('✅ Created admin user')
  } else {
    // Update existing admin password to ensure it's correct
    admin = await prisma.user.update({
      where: { email: 'admin@vanityhub.com' },
      data: {
        password: adminPassword,
        isActive: true,
      },
    })
    console.log('✅ Updated admin user password')
  }

  // Create the 5 specific locations (check for existing first to prevent duplicates)
  console.log('🏢 Creating 5 salon locations...')

  let dRingLocation = await prisma.location.findFirst({
    where: { name: 'D-ring road', isActive: true }
  })
  if (!dRingLocation) {
    dRingLocation = await prisma.location.create({
      data: {
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
    })
    console.log('  ✅ Created location: D-ring road')
  } else {
    console.log('  ⏭️  Location already exists: D-ring road')
  }

  let muaitherLocation = await prisma.location.findFirst({
    where: { name: 'Muaither', isActive: true }
  })
  if (!muaitherLocation) {
    muaitherLocation = await prisma.location.create({
      data: {
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
    })
    console.log('  ✅ Created location: Muaither')
  } else {
    console.log('  ⏭️  Location already exists: Muaither')
  }

  let medinatKhalifaLocation = await prisma.location.findFirst({
    where: { name: 'Medinat Khalifa', isActive: true }
  })
  if (!medinatKhalifaLocation) {
    medinatKhalifaLocation = await prisma.location.create({
      data: {
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
    })
    console.log('  ✅ Created location: Medinat Khalifa')
  } else {
    console.log('  ⏭️  Location already exists: Medinat Khalifa')
  }

  let homeServiceLocation = await prisma.location.findFirst({
    where: { name: 'Home service', isActive: true }
  })
  if (!homeServiceLocation) {
    homeServiceLocation = await prisma.location.create({
      data: {
        id: 'home',
        name: 'Home Service',
        address: 'Mobile Service',
        city: 'Doha',
        state: 'Doha',
        zipCode: '00000',
        country: 'Qatar',
        phone: '+974 1234 5681',
        email: 'homeservice@vanityhub.com',
      },
    })
    console.log('  ✅ Created location: Home Service')
  } else {
    console.log('  ⏭️  Location already exists: Home Service')
  }

  let onlineStoreLocation = await prisma.location.findFirst({
    where: { name: 'Online store', isActive: true }
  })
  if (!onlineStoreLocation) {
    onlineStoreLocation = await prisma.location.create({
      data: {
        id: 'online',
        name: 'Online Store',
        address: 'Online',
        city: 'Doha',
        state: 'Doha',
        zipCode: '00001',
        country: 'Qatar',
        phone: '+974 1234 5682',
        email: 'online@vanityhub.com',
      },
    })
    console.log('  ✅ Created location: Online Store')
  } else {
    console.log('  ⏭️  Location already exists: Online Store')
  }

  const locations = [dRingLocation, muaitherLocation, medinatKhalifaLocation, homeServiceLocation, onlineStoreLocation]

  // Create real salon services
  console.log(`🌱 Creating ${realServiceData.length} real salon services...`)
  const services = []

  for (const serviceData of realServiceData) {
    // Check if service already exists to prevent duplicates
    let service = await prisma.service.findFirst({
      where: {
        name: serviceData.name,
        isActive: true
      }
    })

    if (!service) {
      service = await prisma.service.create({
        data: {
          name: serviceData.name,
          description: `Professional ${serviceData.name.toLowerCase()} service`,
          duration: serviceData.duration,
          price: serviceData.price,
          category: serviceData.category,
          isActive: true,
          showPricesToClients: true,
        },
      })
      console.log(`  ✅ Created service: ${serviceData.name}`)
    } else {
      console.log(`  ⏭️  Service already exists: ${serviceData.name}`)
    }
    services.push(service)
  }

  // Associate all services with all physical locations (except Online store which is for products only)
  console.log('🔗 Associating services with locations...')
  for (const service of services) {
    // Associate with physical locations (not online store)
    for (const location of locations.slice(0, 4)) { // First 4 locations (excluding online store)
      // Check if association already exists
      const existingAssociation = await prisma.locationService.findFirst({
        where: {
          locationId: location.id,
          serviceId: service.id,
        },
      })

      if (!existingAssociation) {
        await prisma.locationService.create({
          data: {
            locationId: location.id,
            serviceId: service.id,
            price: service.price, // Use same price for all locations
            isActive: true,
          },
        })
      }
    }
  }

  // Create real staff members with comprehensive HR data
  console.log('👥 Creating 23 real staff members...')

  // Location mapping: 0=D-Ring Road, 1=Muaither, 2=Medinat Khalifa, 3=Home Service, 4=Online Store
  const staffData = [
    { name: 'Tsedey Asefa', email: 'Tsedey@habeshasalon.com', phone: '77798124', role: 'Manager', empNo: '9100', qid: '28623000532', passport: 'ep6252678', qidValidity: '01-12-25', passportValidity: '22-11-25', medicalValidity: '01-01-26', dob: '10-05-86', locations: [0, 1, 2, 3, 4], homeService: true },
    { name: 'Mekdes Bekele', email: 'mekdes@habeshasalon.com', phone: '33481527', role: 'Stylist', empNo: '9101', qid: '28623003433', passport: 'EP7832122', qidValidity: '01-12-25', passportValidity: '24-05-28', medicalValidity: '01-01-26', dob: '23-02-86', locations: [0], homeService: true },
    { name: 'Aster Tarekegn', email: 'aster@habeshasalon.com', phone: '66868083', role: 'Stylist', empNo: '9102', qid: '29023002985', passport: 'EP6586158', qidValidity: '26-08-26', passportValidity: '13-07-26', medicalValidity: '01-01-26', dob: '04-09-90', locations: [0], homeService: true },
    { name: 'Gelila Asrat', email: 'gelila@habeshasalon.com', phone: '51101385', role: 'Nail Artist', empNo: '9103', qid: '30023001427', passport: 'EQ2036945', qidValidity: '07-05-26', passportValidity: '17-02-30', medicalValidity: '01-01-26', dob: '28-01-00', locations: [0], homeService: true },
    { name: 'Samri Tufa', email: 'samri@habeshasalon.com', phone: '50579597', role: 'Nail Artist', empNo: '9104', qid: '29423002678', passport: 'EP6949093', qidValidity: '21-01-26', passportValidity: '08-03-27', medicalValidity: '01-01-26', dob: '07-08-94', locations: [0], homeService: true },
    { name: 'Vida Agbali', email: 'Vida@habeshasalon.com', phone: '31407033', role: 'Stylist', empNo: '9105', qid: '29228801597', passport: 'G2323959', qidValidity: '21-04-26', passportValidity: '21-01-31', medicalValidity: '01-01-26', dob: '25-10-92', locations: [0], homeService: true },
    { name: 'Genet Yifru', email: 'genet@habeshasalon.com', phone: '50085617', role: 'Pedecurist', empNo: '9106', qid: '28023003513', passport: 'EP7405867', qidValidity: '25-02-26', passportValidity: '13-12-27', medicalValidity: '01-01-26', dob: '19-07-80', locations: [0], homeService: true },
    { name: 'Woyni Tilahun', email: 'Woyni@habeshasalon.com', phone: '33378522', role: 'Stylist', empNo: '9107', qid: '28723005500', passport: 'EP', qidValidity: '17-09-25', passportValidity: '20-10-27', medicalValidity: '01-01-26', dob: '12-07-87', locations: [2], homeService: true },
    { name: 'Habtam Wana', email: 'habtam@habeshasalon.com', phone: '59996537', role: 'Stylist', empNo: '9108', qid: '28923005645', passport: 'EP6217793', qidValidity: '25-02-26', passportValidity: '18-10-25', medicalValidity: '01-01-26', dob: '20-09-89', locations: [2], homeService: true },
    { name: 'Jeri Hameso', email: 'Jeri@habeshasalon.com', phone: '70365925', role: 'Stylist', empNo: '9109', qid: '29023004807', passport: 'EP8743913', qidValidity: '09-07-25', passportValidity: '17-03-29', medicalValidity: '01-01-26', dob: '20-10-90', locations: [2], homeService: true },
    { name: 'Beti-MK', email: 'beti@habeshasalon.com', phone: '66830977', role: 'Stylist', empNo: '9110', qid: '', passport: '', qidValidity: '', passportValidity: '', medicalValidity: '01-01-26', dob: '', locations: [2], homeService: true },
    { name: 'Ruth Tadesse', email: 'Ruth@habeshasalon.com', phone: '50227010', role: 'Beautician', empNo: '9111', qid: '28923005561', passport: 'EP6757286', qidValidity: '28-02-26', passportValidity: '22-10-26', medicalValidity: '01-01-26', dob: '18-7-89', locations: [1], homeService: false },
    { name: 'Elsa Melaku', email: 'Elsa@habeshasalon.com', phone: '50104456', role: 'Sylist and Nail technician', empNo: '9112', qid: '27923002347', passport: 'EP7085203', qidValidity: '11-07-27', passportValidity: '19-06-27', medicalValidity: '01-01-26', dob: '10-11-79', locations: [1], homeService: false },
    { name: 'Titi Leakemaryam', email: 'Titi@habeshasalon.com', phone: '59991432', role: 'Stylist', empNo: '9113', qid: '28723007773', passport: 'EP6197364', qidValidity: '13-03-26', passportValidity: '19-08-25', medicalValidity: '01-01-26', dob: '09-10-87', locations: [1], homeService: true },
    { name: 'Yenu Aschalew', email: 'Yenu@habeshasalon.com', phone: '30614686', role: 'Beautician', empNo: '9114', qid: '28023003515', passport: 'EP7979493', qidValidity: '14-05-26', passportValidity: '01-04-28', medicalValidity: '01-01-26', dob: '22-02-80', locations: [1], homeService: false },
    { name: 'Frie Bahru', email: 'frie@habeshasalon.com', phone: '51179966', role: 'Beautician', empNo: '9115', qid: '29123003741', passport: 'EP7212333', qidValidity: '15-01-26', passportValidity: '17-07-27', medicalValidity: '01-01-26', dob: '29-01-91', locations: [1], homeService: true },
    { name: 'Zed Teklay', email: 'zed@habeshasalon.com', phone: '50764570', role: 'Stylist', empNo: '9116', qid: '29523002064', passport: 'EP8133993', qidValidity: '12-10-25', passportValidity: '07-10-28', medicalValidity: '01-01-26', dob: '16-05-95', locations: [1], homeService: true },
    { name: 'Beti Thomas', email: 'beti@habeshasalon.com', phone: '30732501', role: 'Stylist', empNo: '9117', qid: '29123002832', passport: 'EP6689476', qidValidity: '02-05-26', passportValidity: '13-9-26', medicalValidity: '01-01-26', dob: '12-09-91', locations: [1], homeService: true },
    { name: 'Maya Gebrezgi', email: 'maya@habeshasalon.com', phone: '51337449', role: 'Stylist', empNo: '9118', qid: '222025002506', passport: '', qidValidity: '', passportValidity: '', medicalValidity: '01-01-26', dob: '', locations: [1], homeService: true },
    { name: 'Tirhas Tajebe', email: 'tirhas@habeshasalon.com', phone: '', role: 'Nail Artist', empNo: '9119', qid: '382025419997', passport: '', qidValidity: '', passportValidity: '', medicalValidity: '01-01-26', dob: '', locations: [1], homeService: true },
    { name: 'Tsigereda Esayas', email: 'tsigereda@habeshasalon.com', phone: '55849079', role: 'Stylist', empNo: '9120', qid: '382024482060', passport: '', qidValidity: '', passportValidity: '', medicalValidity: '01-01-26', dob: '', locations: [1], homeService: true },
    { name: 'Shalom Kuna', email: 'shalom@habeshasalon.com', phone: '551011295', role: 'Beautician', empNo: '9121', qid: '29135634320', passport: '', qidValidity: '', passportValidity: '', medicalValidity: '01-01-26', dob: '', locations: [1], homeService: true },
    { name: 'Samrawit Legese', email: 'samrawit@habeshasalon.com', phone: '33462505', role: 'Sales', empNo: '9122', qid: '', passport: '', qidValidity: '', passportValidity: '', medicalValidity: '', dob: '', locations: [4], homeService: true }
  ]

  const staffMembers = []
  const staffPassword = await bcrypt.hash('Admin33#', 10) // Same password as admin for consistency

  for (let i = 0; i < staffData.length; i++) {
    const staff = staffData[i]

    // Create user account (or get existing one)
    let staffUser = await prisma.user.findUnique({
      where: { email: staff.email }
    })

    if (!staffUser) {
      staffUser = await prisma.user.create({
        data: {
          email: staff.email,
          password: staffPassword,
          role: staff.role === 'Manager' ? 'ADMIN' : 'STAFF', // Manager gets ADMIN role
          isActive: true,
        },
      })
      console.log(`  ✅ Created user: ${staff.name}`)
    } else {
      // Update existing user password and role
      staffUser = await prisma.user.update({
        where: { email: staff.email },
        data: {
          password: staffPassword,
          role: staff.role === 'Manager' ? 'ADMIN' : 'STAFF',
          isActive: true,
        },
      })
      console.log(`  ✅ Updated user: ${staff.name}`)
    }

    // Parse date of birth if provided
    let dateOfBirth = null
    if (staff.dob) {
      const [day, month, year] = staff.dob.split('-')
      const fullYear = year.length === 2 ? `19${year}` : year
      dateOfBirth = new Date(`${fullYear}-${month}-${day}`)
    }

    // Check if staff member already exists
    let staffMember = await prisma.staffMember.findFirst({
      where: { userId: staffUser.id }
    })

    if (!staffMember) {
      // Create staff member with HR data
      staffMember = await prisma.staffMember.create({
        data: {
          userId: staffUser.id,
          name: staff.name,
          phone: staff.phone ? `+974 ${staff.phone}` : '',
          jobRole: staff.role,
          employeeNumber: staff.empNo,
          qidNumber: staff.qid || '',
          passportNumber: staff.passport || '',
          qidValidity: staff.qidValidity || '',
          passportValidity: staff.passportValidity || '',
          medicalValidity: staff.medicalValidity || '',
          color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`, // Generate unique colors
          homeService: staff.homeService,
          status: 'ACTIVE',
          dateOfBirth: dateOfBirth,
        },
      })
      console.log(`  ✅ Created staff profile: ${staff.name} (${staff.role})`)
    } else {
      // Update existing staff member
      staffMember = await prisma.staffMember.update({
        where: { id: staffMember.id },
        data: {
          name: staff.name,
          phone: staff.phone ? `+974 ${staff.phone}` : '',
          jobRole: staff.role,
          employeeNumber: staff.empNo,
          qidNumber: staff.qid || '',
          passportNumber: staff.passport || '',
          qidValidity: staff.qidValidity || '',
          passportValidity: staff.passportValidity || '',
          medicalValidity: staff.medicalValidity || '',
          homeService: staff.homeService,
          status: 'ACTIVE',
          dateOfBirth: dateOfBirth,
        },
      })
      console.log(`  ✅ Updated staff profile: ${staff.name} (${staff.role})`)
    }

    staffMembers.push({ member: staffMember, locationIndices: staff.locations })
  }

  // Create client users (or get existing ones)
  console.log('👥 Creating sample client users...')
  const client1Password = await bcrypt.hash('Admin33#', 10)
  let client1User = await prisma.user.findUnique({
    where: { email: 'client1@example.com' }
  })

  if (!client1User) {
    client1User = await prisma.user.create({
      data: {
        email: 'client1@example.com',
        password: client1Password,
        role: 'CLIENT',
        isActive: true,
      },
    })
  }

  let client1 = await prisma.client.findFirst({
    where: { userId: client1User.id }
  })

  if (!client1) {
    client1 = await prisma.client.create({
      data: {
        userId: client1User.id,
        name: 'Emma Wilson',
        phone: '+974 1234 5682',
        preferences: 'Prefers morning appointments',
      },
    })
  }

  const client2Password = await bcrypt.hash('Admin33#', 10)
  let client2User = await prisma.user.findUnique({
    where: { email: 'client2@example.com' }
  })

  if (!client2User) {
    client2User = await prisma.user.create({
      data: {
        email: 'client2@example.com',
        password: client2Password,
        role: 'CLIENT',
        isActive: true,
      },
    })
  }

  let client2 = await prisma.client.findFirst({
    where: { userId: client2User.id }
  })

  if (!client2) {
    client2 = await prisma.client.create({
      data: {
        userId: client2User.id,
        name: 'Fatima Al-Rashid',
        phone: '+974 1234 5683',
        preferences: 'Allergic to certain hair products',
      },
    })
  }

  // Link staff to locations
  console.log('🔗 Linking staff to locations...')
  for (const staffInfo of staffMembers) {
    for (const locationIndex of staffInfo.locationIndices) {
      // Check if link already exists
      const existingLink = await prisma.staffLocation.findFirst({
        where: {
          staffId: staffInfo.member.id,
          locationId: locations[locationIndex].id,
        },
      })

      if (!existingLink) {
        await prisma.staffLocation.create({
          data: {
            staffId: staffInfo.member.id,
            locationId: locations[locationIndex].id,
          },
        })
        console.log(`  ✅ Linked ${staffInfo.member.name} to ${locations[locationIndex].name}`)
      }
    }
  }

  // Services are already linked to locations above, so skip this duplicate step

  // Link staff to services based on their roles
  console.log('🔗 Linking staff to services based on roles...')
  for (const staffInfo of staffMembers) {
    const role = staffData.find(s => s.name === staffInfo.member.name)?.role

    // Assign services based on role
    const serviceAssignments = []

    if (role === 'Stylist' || role === 'Manager') {
      // Stylists and Managers get hair services
      const hairServices = services.filter(s =>
        s.category === 'Braiding' ||
        s.category === 'Hair Extension' ||
        s.category === 'Styling' ||
        s.category === 'Hair Treatment' ||
        s.category === 'Color'
      )
      serviceAssignments.push(...hairServices.slice(0, 15)) // More services for stylists
    } else if (role === 'Nail Artist' || role === 'Nail technician') {
      // Nail specialists get nail services
      const nailServices = services.filter(s => s.category === 'Nail')
      serviceAssignments.push(...nailServices)
    } else if (role === 'Beautician') {
      // Beauticians get beauty services
      const beautyServices = services.filter(s =>
        s.category === 'Eyelash' ||
        s.category === 'Threading' ||
        s.category === 'Waxing' ||
        s.category === 'Henna' ||
        s.category === 'Massage And Spa'
      )
      serviceAssignments.push(...beautyServices.slice(0, 10))
    } else if (role === 'Pedecurist') {
      // Pedecurists get nail and foot services
      const footServices = services.filter(s =>
        s.category === 'Nail' ||
        s.category === 'Massage And Spa'
      )
      serviceAssignments.push(...footServices.slice(0, 8))
    } else if (role === 'Sylist and Nail technician') {
      // Combined role gets both hair and nail services
      const combinedServices = services.filter(s =>
        s.category === 'Braiding' ||
        s.category === 'Hair Extension' ||
        s.category === 'Styling' ||
        s.category === 'Nail'
      )
      serviceAssignments.push(...combinedServices.slice(0, 15))
    } else if (role === 'Sales') {
      // Sales staff don't need service assignments
      serviceAssignments.push()
    }

    // Create staff-service associations (skip if already exists)
    for (const service of serviceAssignments) {
      const existingAssignment = await prisma.staffService.findFirst({
        where: {
          staffId: staffInfo.member.id,
          serviceId: service.id,
        },
      })

      if (!existingAssignment) {
        await prisma.staffService.create({
          data: {
            staffId: staffInfo.member.id,
            serviceId: service.id,
          },
        })
      }
    }

    if (serviceAssignments.length > 0) {
      console.log(`  ✅ Assigned ${serviceAssignments.length} services to ${staffInfo.member.name}`)
    }
  }

  // Create sample appointments
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const appointment1 = await prisma.appointment.create({
    data: {
      bookingReference: 'VH-001',
      clientId: client1User.id,
      staffId: staffMembers[0].member.id, // First staff member
      locationId: locations[0].id, // D-ring road location
      date: tomorrow,
      duration: 60,
      totalPrice: 150,
      status: 'CONFIRMED',
      notes: 'First time client',
    },
  })

  await prisma.appointmentService.create({
    data: {
      appointmentId: appointment1.id,
      serviceId: services[0].id,
      price: 150,
      duration: 60,
    },
  })

  // Create loyalty programs
  await Promise.all([
    prisma.loyaltyProgram.create({
      data: {
        clientId: client1.id,
        points: 150,
        tier: 'Silver',
        totalSpent: 450,
      },
    }),
    prisma.loyaltyProgram.create({
      data: {
        clientId: client2.id,
        points: 80,
        tier: 'Bronze',
        totalSpent: 240,
      },
    }),
  ])

  console.log('✅ Database seeding completed successfully!')
  console.log('📊 Created:')
  console.log('  - 23 users (1 admin, 20 staff, 2 clients)')
  console.log('  - 5 locations (D-ring road, Muaither, Medinat Khalifa, Home service, Online store)')
  console.log(`  - ${realServiceData.length} real salon services`)
  console.log(`  - ${realServiceData.length * 4} location-service associations (excluding online store)`)
  console.log('  - 20 staff members with comprehensive HR data')
  console.log('  - 1 sample appointment')
  console.log('  - 2 loyalty programs')

  // Count services by category
  const categoryCount = realServiceData.reduce((acc, service) => {
    acc[service.category] = (acc[service.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('📋 Services by category:')
  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count} services`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
