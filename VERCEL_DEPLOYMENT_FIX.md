# Vercel Deployment Fix - Login Issue Resolution

## Problem
Admin cannot log in to production at https://habesha-bc.vercel.app/login

## Root Cause
Missing or incorrect environment variables in Vercel production environment.

## Solution Steps

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project settings: https://vercel.com/vanityerps-projects/habesha-bc/settings/environment-variables

Add these **REQUIRED** environment variables:

```
NEXTAUTH_SECRET=a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9
NEXTAUTH_URL=https://habesha-bc.vercel.app
DATABASE_URL=postgresql://postgres:jFq87cdhsdJnkigC@db.dzdgtmebfgdvglgldlph.supabase.co:5432/postgres?sslmode=require&connection_limit=20&pool_timeout=10
DIRECT_URL=postgresql://postgres:jFq87cdhsdJnkigC@db.dzdgtmebfgdvglgldlph.supabase.co:5432/postgres
NODE_ENV=production
```

**CRITICAL**: Make sure `NEXTAUTH_URL` matches your production domain exactly!

### Step 2: Verify Environment Variables

After adding the variables:
1. Go to: https://vercel.com/vanityerps-projects/habesha-bc/settings/environment-variables
2. Ensure all 5 variables are listed
3. Make sure they're set for "Production" environment

### Step 3: Redeploy

Option A - Via Vercel Dashboard:
1. Go to: https://vercel.com/vanityerps-projects/habesha-bc/deployments
2. Find the latest deployment
3. Click the three dots (...)
4. Click "Redeploy"
5. Check "Use existing Build Cache" OFF
6. Click "Redeploy"

Option B - Via Command Line:
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

### Step 4: Verify Deployment

After deployment completes (2-3 minutes):

1. Visit: https://habesha-bc.vercel.app/api/diagnose
2. Check the response shows:
   - `nextAuthConfigured: true`
   - `nextAuthUrl: "https://habesha-bc.vercel.app"`
   - `databaseConnection: true`
   - `adminUserExists: true`
   - `adminUserActive: true`
   - `canHashPasswords: true`

### Step 5: Test Login

Go to: https://habesha-bc.vercel.app/login

Use these credentials:
```
Email: admin@vanityhub.com
Password: Admin2024
```

## If Still Not Working

### Check Vercel Logs:
1. Go to: https://vercel.com/vanityerps-projects/habesha-bc/logs
2. Look for authentication errors
3. Share any error messages

### Common Issues:

**Issue**: NEXTAUTH_URL mismatch
- **Fix**: Ensure `NEXTAUTH_URL=https://habesha-bc.vercel.app` (no trailing slash)

**Issue**: Database not accessible from Vercel
- **Fix**: Check Supabase connection settings allow Vercel's IP ranges

**Issue**: NEXTAUTH_SECRET not set
- **Fix**: Must be exactly: `a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9`

## Admin Credentials

Current admin account in database:
- Email: `admin@vanityhub.com`
- Password: `Admin2024`
- Role: `ADMIN`
- Status: `Active`

## Technical Details

The application uses:
- Next.js 15 with App Router
- NextAuth.js v5 for authentication
- Prisma with PostgreSQL (Supabase)
- bcryptjs for password hashing

Authentication flow:
1. User submits credentials at `/login`
2. NextAuth validates via Credentials Provider in `auth.ts`
3. Prisma queries database for user
4. bcrypt compares password hash
5. JWT session token created
6. User redirected to dashboard

## Emergency Contact

If login still fails after following all steps, the issue is likely:
1. Environment variables not properly set in Vercel
2. NEXTAUTH_URL pointing to wrong domain
3. Database connection blocked by firewall
