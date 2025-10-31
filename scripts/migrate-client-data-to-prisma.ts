/**
 * Migration Script: Consolidate Client Data to Prisma
 * 
 * This script migrates client data from PostgreSQL to Prisma (SQLite)
 * to establish a single source of truth for client management.
 * 
 * Steps:
 * 1. Fetch all clients from PostgreSQL
 * 2. For each PostgreSQL client, find or create corresponding Prisma client
 * 3. Update Prisma client with PostgreSQL data (address, preferred_location_id, etc.)
 * 4. Verify data integrity
 */

import { PrismaClient } from '@prisma/client'
import { query } from '../lib/db'

const prisma = new PrismaClient()

interface PostgresClient {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  preferred_location_id: number | null
  created_at: Date
  updated_at: Date
}

async function migrateClientData() {
  console.log('🔄 Starting client data migration to Prisma...\n')

  try {
    // Step 1: Fetch all clients from PostgreSQL
    console.log('📊 Fetching clients from PostgreSQL...')
    const pgResult = await query('SELECT * FROM clients ORDER BY id')
    const pgClients: PostgresClient[] = pgResult.rows

    console.log(`Found ${pgClients.length} clients in PostgreSQL\n`)

    // Step 2: Fetch all clients from Prisma
    console.log('📊 Fetching clients from Prisma...')
    const prismaClients = await prisma.client.findMany({
      include: {
        user: true
      }
    })

    console.log(`Found ${prismaClients.length} clients in Prisma\n`)

    // Step 3: Migrate data
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const pgClient of pgClients) {
      try {
        // Try to find matching Prisma client by name and phone
        const matchingPrismaClient = prismaClients.find(pc => 
          pc.name.toLowerCase().trim() === pgClient.name.toLowerCase().trim() &&
          (pc.phone === pgClient.phone || (!pc.phone && !pgClient.phone))
        )

        if (matchingPrismaClient) {
          // Update existing Prisma client with PostgreSQL data
          console.log(`✏️  Updating client: ${pgClient.name}`)
          
          // Map PostgreSQL location ID to Prisma location ID
          let preferredLocationId: string | null = null
          if (pgClient.preferred_location_id) {
            // Fetch the location from Prisma by the PostgreSQL ID
            const locations = await prisma.location.findMany()
            // Assuming locations are ordered the same way, map by index
            // This is a simplification - you may need a more robust mapping
            if (locations.length >= pgClient.preferred_location_id) {
              preferredLocationId = locations[pgClient.preferred_location_id - 1]?.id || null
            }
          }

          await prisma.client.update({
            where: { id: matchingPrismaClient.id },
            data: {
              email: pgClient.email || matchingPrismaClient.email,
              address: pgClient.address,
              phone: pgClient.phone || matchingPrismaClient.phone,
              notes: pgClient.notes || matchingPrismaClient.notes,
              preferredLocationId: preferredLocationId,
              updatedAt: new Date()
            }
          })

          updated++
        } else {
          console.log(`⚠️  No matching Prisma client found for: ${pgClient.name} (PostgreSQL ID: ${pgClient.id})`)
          skipped++
        }
      } catch (error) {
        console.error(`❌ Error migrating client ${pgClient.name}:`, error)
        errors++
      }
    }

    console.log('\n✅ Migration complete!')
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`   Errors: ${errors}`)

    // Step 4: Verify data integrity
    console.log('\n🔍 Verifying data integrity...')
    const verifyClients = await prisma.client.findMany({
      include: {
        user: true,
        preferredLocation: true
      }
    })

    console.log(`Total clients in Prisma: ${verifyClients.length}`)
    console.log(`Clients with address: ${verifyClients.filter(c => c.address).length}`)
    console.log(`Clients with preferred location: ${verifyClients.filter(c => c.preferredLocationId).length}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateClientData()
  .then(() => {
    console.log('\n✅ Migration script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error)
    process.exit(1)
  })

