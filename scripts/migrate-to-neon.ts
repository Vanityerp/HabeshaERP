import { Pool } from 'pg'

// Source: Supabase
const supabasePool = new Pool({
  connectionString: 'postgresql://postgres:jFq87cdhsdJnkigC@db.dzdgtmebfgdvglgldlph.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
  max: 1,
})

// Destination: Neon (will be set from env var)
const neonPool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
})

async function migrateTables() {
  console.log('🚀 Starting migration from Supabase to Neon...\n')

  try {
    // Test connections
    console.log('📡 Testing Supabase connection...')
    const supabaseTest = await supabasePool.query('SELECT NOW()')
    console.log('✅ Supabase connected:', supabaseTest.rows[0].now)

    console.log('📡 Testing Neon connection...')
    const neonTest = await neonPool.query('SELECT NOW()')
    console.log('✅ Neon connected:', neonTest.rows[0].now)
    console.log('')

    // Get all tables in order (respecting foreign keys)
    const tables = [
      'users',
      'locations',
      'clients',
      'staff_members',
      'staff_schedules',
      'staff_locations',
      'services',
      'staff_services',
      'location_services',
      'products',
      'product_locations',
      'product_batches',
      'appointments',
      'appointment_services',
      'appointment_products',
      'transactions',
      'loyalty_programs',
      'memberships',
      'membership_tiers',
      'membership_transactions',
      'gift_cards',
      'gift_card_transactions',
      'inventory_audits',
      'transfers',
      'audit_logs',
    ]

    console.log(`📊 Found ${tables.length} tables to migrate\n`)

    let totalRows = 0

    for (const table of tables) {
      try {
        console.log(`⏳ Migrating table: ${table}...`)

        // Get data from Supabase
        const result = await supabasePool.query(`SELECT * FROM "${table}"`)
        const rows = result.rows

        if (rows.length === 0) {
          console.log(`   ℹ️  No data in ${table}`)
          continue
        }

        console.log(`   📦 Found ${rows.length} rows`)

        // Get column names
        const columns = Object.keys(rows[0])
        const columnNames = columns.map(c => `"${c}"`).join(', ')
        const placeholders = rows.map((_, rowIndex) => {
          const rowPlaceholders = columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`)
          return `(${rowPlaceholders.join(', ')})`
        }).join(', ')

        // Prepare values
        const values = rows.flatMap(row => columns.map(col => row[col]))

        // Insert into Neon
        const insertQuery = `
          INSERT INTO "${table}" (${columnNames})
          VALUES ${placeholders}
          ON CONFLICT DO NOTHING
        `

        await neonPool.query(insertQuery, values)
        console.log(`   ✅ Migrated ${rows.length} rows to ${table}`)
        totalRows += rows.length

      } catch (error: any) {
        console.error(`   ❌ Error migrating ${table}:`, error.message)
        // Continue with next table
      }
    }

    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Migration completed!`)
    console.log(`📊 Total rows migrated: ${totalRows}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await supabasePool.end()
    await neonPool.end()
  }
}

// Run migration
migrateTables()
  .then(() => {
    console.log('\n🎉 Migration successful!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error)
    process.exit(1)
  })
