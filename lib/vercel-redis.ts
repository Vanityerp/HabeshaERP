// Vercel Redis Integration for HabeshaERP
import { Redis } from 'ioredis';

// Configuration for Vercel Redis
export const configureVercelRedis = () => {
  // Check for Vercel Redis URL format
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  
  if (!redisUrl) {
    // eslint-disable-next-line no-console
    console.warn('No Redis URL found in environment variables. Using fallback cache.');
    return null;
  }

  try {
    // Configure Redis client with Vercel-specific settings
    const redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      // Vercel-specific settings
      tls: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      password: process.env.REDIS_PASSWORD || process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Set up event handlers
    redisClient.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.error('Vercel Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('Vercel Redis connected successfully');
    });

    return redisClient;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize Vercel Redis:', error);
    return null;
  }
};

// Initialize Redis on application startup
export const initializeVercelRedis = async () => {
  const redisClient = configureVercelRedis();
  
  if (redisClient) {
    try {
      // Test connection
      await redisClient.ping();
      // eslint-disable-next-line no-console
      console.log('✅ Vercel Redis connection successful');
      return redisClient;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Vercel Redis connection test failed:', error);
      return null;
    }
  }
  
  return null;
};