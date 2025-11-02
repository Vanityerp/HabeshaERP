# Neon Database Setup for Vercel

## Step 1: Create Neon Database

1. Go to https://console.neon.tech/
2. Sign in (you can use your Vercel account)
3. Create a new project called "HabeshaERP"
4. Copy the connection string - it will look like:
   ```
   postgresql://[user]:[password]@[host].neon.tech/[dbname]?sslmode=require
   ```

## Step 2: Set Environment Variables in Vercel

```powershell
# Remove old DATABASE_URL
vercel env rm DATABASE_URL production

# Add Neon DATABASE_URL (replace with your actual Neon connection string)
echo "YOUR_NEON_CONNECTION_STRING" | vercel env add DATABASE_URL production
```

## Step 3: Migrate Data from Supabase to Neon

### Option A: Using pg_dump (Recommended)

```powershell
# Export from Supabase
pg_dump "postgresql://postgres:jFq87cdhsdJnkigC@db.dzdgtmebfgdvglgldlph.supabase.co:5432/postgres" > backup.sql

# Import to Neon
psql "YOUR_NEON_CONNECTION_STRING" < backup.sql
```

### Option B: Run Prisma migrations on Neon

```powershell
# Set DATABASE_URL to Neon locally
$env:DATABASE_URL="YOUR_NEON_CONNECTION_STRING"

# Run migrations
npx prisma migrate deploy

# Seed admin user
npx tsx scripts/set-simple-password.ts
```

## Step 4: Deploy

```powershell
vercel --prod --yes --force
```

## Step 5: Test Login

Go to: https://habesha-erp.vercel.app/login

Email: admin@vanityhub.com
Password: Admin2024

## Why Neon?

1. **Built for Vercel** - Native integration, no connection issues
2. **Serverless** - Automatically scales, no connection pooling needed
3. **Fast** - Low latency from Vercel edge network
4. **Free tier** - 512 MB storage, perfect for production

## Connection String Format

Neon connection strings look like:
```
postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

No need for poolers or special configuration!
