const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const locations = [
  {
    name: 'D-Ring Road',
    address: 'D-Ring Road Branch',
    city: 'Doha',
    country: 'Qatar',
    phone: '+974 XXXXXXXX',
    email: 'dring@habeshasalon.com',
    isActive: true
  },
  {
    name: 'Medinat Khalifa',
    address: 'Medinat Khalifa Branch',
    city: 'Doha',
    country: 'Qatar',
    phone: '+974 XXXXXXXX',
    email: 'medinat@habeshasalon.com',
    isActive: true
  },
  {
    name: 'Muaither',
    address: 'Muaither Branch',
    city: 'Doha',
    country: 'Qatar',
    phone: '+974 XXXXXXXX',
    email: 'muaither@habeshasalon.com',
    isActive: true
  },
  {
    name: 'All',
    address: 'All Locations',
    city: 'Doha',
    country: 'Qatar',
    phone: '+974 XXXXXXXX',
    email: 'admin@habeshasalon.com',
    isActive: true
  },
  {
    name: 'Online Store',
    address: 'Online Sales',
    city: 'Doha',
    country: 'Qatar',
    phone: '+974 XXXXXXXX',
    email: 'online@habeshasalon.com',
    isActive: true
  }
]

async function createLocations() {
  console.log('🏢 Creating locations...\n')

  for (const location of locations) {
    try {
      // Check if location already exists
      const existing = await prisma.location.findFirst({
        where: { name: location.name }
      })

      if (existing) {
        console.log(`✓ Location "${location.name}" already exists`)
      } else {
        await prisma.location.create({
          data: location
        })
        console.log(`✅ Created location: ${location.name}`)
      }
    } catch (error) {
      console.error(`❌ Error creating ${location.name}:`, error.message)
    }
  }

  // Display all locations
  const allLocations = await prisma.location.findMany({
    orderBy: { name: 'asc' }
  })

  console.log(`\n📊 Total Locations: ${allLocations.length}`)
  console.log('\nLocations in database:')
  allLocations.forEach(loc => {
    console.log(`  - ${loc.name} (${loc.city}, ${loc.country}) - ${loc.isActive ? '✅ Active' : '❌ Inactive'}`)
  })
}

createLocations()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
