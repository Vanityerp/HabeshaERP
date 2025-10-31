# Vercel Deployment Guide for Habesha ERP

## Prerequisites
1. Vercel account
2. PostgreSQL database (can be hosted on Supabase, Render, or any PostgreSQL provider)
3. Redis instance (optional but recommended for caching and sessions)

## Environment Variables Required

You need to set the following environment variables in your Vercel project settings:

```
# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-project.vercel.app

# Database
DATABASE_URL=postgresql://username:password@host:port/database_name?schema=public

# Redis (optional but recommended)
REDIS_URL=redis://username:password@host:port

# Application Configuration
USE_MOCK_DATA=false
SKIP_DB_CONNECTION=false

# Prisma Configuration
PRISMA_GENERATE_DATAPROXY=true
```

## Deployment Steps

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. In Vercel project settings, add the required environment variables
4. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## Database Setup

1. Run the Prisma migrations after deployment:
   ```bash
   npx prisma migrate deploy
   ```

2. Seed the database with initial data:
   ```bash
   npx prisma db seed
   ```

## Common Issues and Solutions

### 1. Prisma Client Generation
If you encounter Prisma client issues, ensure `PRISMA_GENERATE_DATAPROXY` is set to `true` in production.

### 2. Database Connection
Make sure your PostgreSQL database is accessible from Vercel. You might need to whitelist Vercel's IP addresses.

### 3. Environment Variables
Ensure all required environment variables are set in Vercel project settings, not just in your local .env file.

## Post-Deployment Verification

1. Check the deployment logs for any errors
2. Verify database connection by accessing a page that requires database access
3. Test authentication by trying to log in
4. Verify that all API endpoints are working correctly

## Useful Vercel Commands

To manually trigger a deployment:
```bash
vercel --prod
```

To check logs:
```bash
vercel logs your-project.vercel.app
```