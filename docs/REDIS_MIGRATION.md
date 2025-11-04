# Redis Migration Guide (Vercel/Upstash)

This guide explains how to enable Redis caching in HabeshaERP using Vercel KV (Upstash) or a standard Redis instance.

## Why migrate to Redis

- Faster API responses by caching frequently accessed data
- Reduced load on the database (Neon/Postgres)
- Better scalability under concurrent traffic

## Current Redis integration in the codebase

- Redis client wrapper: `lib/vercel-redis.ts`
- Caching service: `lib/redis-cache.ts`
- Both support:
  - Standard Redis URL via `REDIS_URL`
  - Upstash/Vercel KV via `UPSTASH_REDIS_REST_URL` + token
  - Optional password via `REDIS_PASSWORD` or `UPSTASH_REDIS_REST_TOKEN`

Key behaviors:
- If Redis env vars are missing, the app gracefully falls back to an in-memory cache.
- TLS is enabled in production with `rejectUnauthorized: false` to avoid cert issues on Vercel.

## Environment variables

Add these environment variables in your deployment platform (Vercel recommended):

For a standard Redis instance:

```env
REDIS_URL=redis://<user>:<password>@<host>:<port>
REDIS_PASSWORD=<password> # optional, used if URL does not include password
```

For Upstash/Vercel KV:

```env
UPSTASH_REDIS_REST_URL=https://<your-upstash-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
```

Notes:
- You can provide either `REDIS_URL` or `UPSTASH_REDIS_REST_URL`+
  `UPSTASH_REDIS_REST_TOKEN`. If both are present, `REDIS_URL` is preferred.
- In production, TLS is enabled automatically to match Vercel's environment.

## Using the cache in code

You can use the exported `redisCache` singleton to cache any data:

```ts
import { redisCache, CACHE_CONFIGS } from "@/lib/redis-cache"

// Attempt to read from cache
const cached = await redisCache.get("locations:list")
if (cached) {
  return cached
}

// Compute/fetch fresh data
const locations = await db.getLocations()

// Write to cache with a predefined config
await redisCache.set("locations:list", locations, CACHE_CONFIGS.locations)

return locations
```

Additional helpers:
- `redisCache.delete(key)` — remove a single entry
- `redisCache.deletePattern(pattern)` — remove keys matching a prefix
- `redisCache.exists(key)` — check key existence
- `redisCache.getStats()` — cache stats (hits, misses, memory, keys)
- `redisCache.clear()` — flush all entries
- `redisCache.healthCheck()` — quick health report

## Migration steps

1) Choose a provider
- Vercel KV (Upstash) — quick setup via Vercel dashboard
- Your own Redis instance — provide `REDIS_URL`

2) Add environment variables
- In Vercel: Project → Settings → Environment Variables
- Add either Upstash or standard Redis variables (see above)
- Set environment to "Production" and/or "Preview" depending on your workflow

3) Redeploy
- Trigger a redeploy from Vercel after adding env vars
- Observe logs: you should see "Redis connected successfully" or
  "✅ Vercel Redis connection successful" during runtime

4) Validate
- Interact with pages that use cache (locations, staff, services)
- Watch for improved load times and fewer DB calls
- Check function logs: no Redis connection errors

## Troubleshooting

- "Connection refused" — check host/port/firewall on your Redis instance
- "Invalid Upstash token" — verify `UPSTASH_REDIS_REST_TOKEN`
- Timeouts — increase `connectTimeout` in `lib/redis-cache.ts` if needed
- SSL issues — ensure production uses TLS with `rejectUnauthorized: false`

## Local development

- Redis is optional; the app will use in-memory cache if no env vars are set.
- You can run a local Redis via Docker:

```bash
docker run -p 6379:6379 --name redis -d redis:7
```

Then set:

```env
REDIS_URL=redis://localhost:6379
```

## References

- `lib/vercel-redis.ts` — connection initialization for Vercel/Upstash
- `lib/redis-cache.ts` — caching service and helper methods
- Vercel KV docs — https://vercel.com/docs/storage/vercel-kv
- Upstash Redis docs — https://upstash.com/docs/redis