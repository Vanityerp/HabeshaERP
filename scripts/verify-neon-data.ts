import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function verifyData() {
  console.log('🔍 Verifying data in Neon database...\n')

  try {
    const tables = [
      { name: 'locations', displayName: 'Locations' },
      { name: 'services', displayName: 'Services' },
      { name: 'staff_members', displayName: 'Staff Members' },
      { name: 'clients', displayName: 'Clients' },
      { name: 'products', displayName: 'Products' },
      { name: 'users', displayName: 'Users' },
    ]

    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) FROM "${table.name}"`)
      const count = parseInt(result.rows[0].count)
      const status = count > 0 ? '✅' : '❌'
      console.log(`${status} ${table.displayName}: ${count} records`)
      
      // Show sample data
      if (count > 0) {
        const sample = await pool.query(`SELECT * FROM "${table.name}" LIMIT 3`)
        console.log(`   Sample: ${JSON.stringify(sample.rows[0], null, 2).substring(0, 200)}...`)
      }
      console.log('')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

verifyData()
