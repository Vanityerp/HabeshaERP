// Test database connection with the exact Vercel environment variables
const { Pool } = require('pg')

// Use the exact connection strings from your Vercel env vars
const DATABASE_URL = "postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=30"

console.log('🔍 Testing database connection...\n')
console.log('Connection string:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'), '\n')

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function testConnection() {
  let client
  try {
    console.log('Attempting to connect...')
    client = await pool.connect()
    console.log('✅ Connected successfully!\n')
    
    // Test a simple query
    console.log('Testing query: SELECT COUNT(*) FROM locations...')
    const result = await client.query('SELECT COUNT(*) FROM locations')
    console.log(`✅ Query successful! Found ${result.rows[0].count} locations\n`)
    
    // Test getting location names
    console.log('Getting location names...')
    const locations = await client.query('SELECT id, name, "isActive" FROM locations')
    console.log('✅ Locations:')
    locations.rows.forEach(loc => {
      console.log(`  - ${loc.name} (${loc.isActive ? 'Active' : 'Inactive'})`)
    })
    
  } catch (error) {
    console.error('❌ Connection failed!')
    console.error('Error:', error.message)
    console.error('\nFull error:', error)
    process.exit(1)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

testConnection()
