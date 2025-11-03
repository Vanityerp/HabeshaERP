// Redis Session Store for NextAuth
import { Redis } from 'ioredis';
import { type SessionStore } from 'next-auth';

export class RedisSessionStore implements SessionStore {
  private redis: Redis;
  private prefix: string;
  private ttl: number;

  constructor(redisInstance: Redis, options: { prefix?: string; ttl?: number } = {}) {
    this.redis = redisInstance;
    this.prefix = options.prefix || 'session:';
    this.ttl = options.ttl || 86400; // 24 hours in seconds
  }

  async createSession(data: any) {
    const sessionId = data.sessionToken;
    const key = this.prefix + sessionId;
    
    await this.redis.set(key, JSON.stringify(data), 'EX', this.ttl);
    return data;
  }

  async getSession(sessionToken: string) {
    const key = this.prefix + sessionToken;
    const data = await this.redis.get(key);
    
    if (!data) return null;
    
    // Refresh TTL on access
    await this.redis.expire(key, this.ttl);
    return JSON.parse(data);
  }

  async updateSession(session: any) {
    const sessionId = session.sessionToken;
    const key = this.prefix + sessionId;
    
    await this.redis.set(key, JSON.stringify(session), 'EX', this.ttl);
    return session;
  }

  async deleteSession(sessionToken: string) {
    const key = this.prefix + sessionToken;
    await this.redis.del(key);
  }
}