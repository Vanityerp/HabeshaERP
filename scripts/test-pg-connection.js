const { Client } = require('pg');

// Use the same DATABASE_URL from your environment
const DATABASE_URL = "postgresql://postgres.dzdgtmebfgdvglgldlph:jFq87cdhsdJnkigC@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=no-verify";

async function testConnection() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🔍 Testing PostgreSQL connection...');
    await client.connect();
    console.log('✅ PostgreSQL connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', result.rows[0].version);
    
    await client.end();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    await client.end();
    process.exit(1);
  }
}

testConnection();