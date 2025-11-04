import Redis from 'ioredis';
import { RedisAdapter } from './redis-adapter';

const redis = new Redis(process.env.REDIS_URL as string);

export const adapter = RedisAdapter(redis);