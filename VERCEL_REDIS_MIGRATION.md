# Vercel Redis Migration Guide

## Overview

This document outlines the migration of HabeshaERP to use Vercel's Redis service for improved performance, reliability, and scalability.

## What Was Migrated to Redis

1. **Session Storage**: User sessions are now stored in Redis instead of memory
2. **API Caching**: All API responses are cached in Redis for faster response times
3. **Rate Limiting**: API rate limiting now uses Redis for distributed rate limiting

## Setup Instructions

### 1. Create a Vercel Redis Instance

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create → Redis
3. Follow the setup wizard to create your Redis instance
4. Once created, copy the connection details

### 2. Configure Environment Variables

Add these environment variables to your Vercel project:

```
UPSTASH_REDIS_REST_URL=your-vercel-redis-url
UPSTASH_REDIS_REST_TOKEN=your-vercel-redis-token
```

### 3. Deploy Your Application

The application will automatically connect to Vercel Redis when deployed.

## Benefits of Redis Migration

- **Improved Performance**: Faster response times with cached data
- **Reduced Database Load**: Less pressure on your PostgreSQL database
- **Scalable Sessions**: User sessions now work across multiple instances
- **Reliable Rate Limiting**: Distributed rate limiting prevents API abuse

## Monitoring Redis Usage

You can monitor your Redis usage in the Vercel dashboard:

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Your Redis Instance
3. View metrics like memory usage, connections, and operations

## Troubleshooting

If you encounter issues with Redis:

1. Check that environment variables are correctly set
2. Verify Redis connection in application logs
3. Ensure Redis instance is running and accessible

## Fallback Mechanism

The application includes a fallback to in-memory storage if Redis is unavailable, ensuring the application continues to function even if Redis connectivity is lost.