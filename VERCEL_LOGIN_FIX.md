# Vercel Login Fix - Complete Guide

## Problem
The login works locally but fails on https://habesha-erp.vercel.app/login with "Invalid email or password"

## Root Cause
The Vercel deployment is not using the correct PostgreSQL database URL. It may be using an old/empty database or missing environment variables.

## Solution Steps

### 1. Set Environment Variables in Vercel

Go to your Vercel project dashboard:
https://vercel.com/vanityerp/habesha/settings/environment-variables

Add these environment variables:

```env
DATABASE_URL=postgres://postgres.dzdgtmebfgdvglgldlph:jFq87cdhsdJnkigC@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require

NEXTAUTH_SECRET=a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9

NEXTAUTH_URL=https://habesha-erp.vercel.app
```

**Important:** Make sure to set these for "Production", "Preview", and "Development" environments.

### 2. Verify Database is Seeded

The database has been seeded with:
- **Email:** admin@vanityhub.com
- **Password:** Admin33#
- 20 staff members
- 5 locations
- 144 services

### 3. Redeploy on Vercel

After setting the environment variables:

1. Go to Vercel dashboard
2. Go to Deployments tab
3. Click "..." on the latest deployment
4. Select "Redeploy"
5. Check "Use existing Build Cache" OFF to ensure fresh build

### 4. Test the Deployment

After redeployment completes:

1. Visit: https://habesha-erp.vercel.app/api/check-db
   - This should show admin user exists
   - Should show PostgreSQL database connected

2. Visit: https://habesha-erp.vercel.app/login
   - Email: admin@vanityhub.com
   - Password: Admin33#

## Quick Commands to Run Locally

Test database connection:
```bash
npx tsx scripts/verify-admin-password.ts
```

Reseed database if needed:
```bash
npx prisma db seed
```

Test authentication flow:
```bash
npx tsx scripts/test-auth-api.ts
```

## Troubleshooting

### If login still fails after redeployment:

1. Check Vercel logs for errors:
   - Go to Deployments → Click latest → View Function Logs

2. Verify environment variables are set:
   ```bash
   vercel env ls
   ```

3. Check database connection from Vercel:
   - Visit: https://habesha-erp.vercel.app/api/check-db
   - Should return admin user info

4. If admin user doesn't exist in production DB:
   ```bash
   # Make sure DATABASE_URL points to production
   npx prisma db seed
   ```

### Alternative: Reset Password via Script

If you need to reset the admin password in production:

```typescript
// Run this with production DATABASE_URL
import { prisma } from './lib/prisma'
import bcrypt from 'bcryptjs'

const newPassword = await bcrypt.hash('Admin33#', 10)
await prisma.user.update({
  where: { email: 'admin@vanityhub.com' },
  data: { password: newPassword, isActive: true }
})
```

## Final Credentials

**Email:** admin@vanityhub.com  
**Password:** Admin33#

⚠️ **Security Note:** Change the admin password after first login in production!
