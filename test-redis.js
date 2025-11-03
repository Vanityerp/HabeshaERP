// Redis Connection Test Script
const Redis = require('ioredis');
require('dotenv').config({ path: '.env.production' });

async function testRedisConnection() {
  console.log('Testing Redis connection...');
  
  // Hardcode the Redis URL for testing
  const redisUrl = "redis://default:P3ON0QvjGMYjGPyvWJO2V1lhArN5utxS@redis-17848.crce198.eu-central-1-3.ec2.redns.redis-cloud.com:17848";
  
  console.log(`📡 Connecting to Redis: ${redisUrl.replace(/\/\/.*?:(.*)@/, '//***:***@')}`);
  
  try {
    const redis = new Redis(redisUrl, {
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
      tls: { rejectUnauthorized: false }
    });
    
    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });
    
    // Test connection with ping
    const pingResult = await redis.ping();
    console.log(`✅ Redis ping result: ${pingResult}`);
    
    // Test set/get operations
    const testKey = 'test:connection:' + Date.now();
    await redis.set(testKey, 'Connection successful');
    const testValue = await redis.get(testKey);
    console.log(`✅ Redis get/set test: ${testValue}`);
    
    // Clean up test key
    await redis.del(testKey);
    console.log('✅ Test key deleted');
    
    // Close connection
    await redis.quit();
    console.log('✅ Redis connection test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Redis connection test failed:', error);
    return false;
  }
}

// Run the test
testRedisConnection()
  .then(success => {
    if (success) {
      console.log('🎉 Redis connection is working properly!');
      process.exit(0);
    } else {
      console.error('❌ Redis connection test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });