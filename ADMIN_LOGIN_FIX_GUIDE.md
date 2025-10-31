# Admin Login Fix Guide for Vercel Production

## Problem
Unable to log in with admin credentials on production (https://habesha-erp.vercel.app)

## Root Cause Analysis
1. **Auto-deployment not working** - Git author email doesn't match Vercel team member
2. **Admin user might not exist or have wrong password** in production database
3. **API routes returning 404** - Deployment might be outdated

## Solution Implemented

### 1. New API Endpoints Created

#### `/api/ensure-admin` (POST)
- Creates or updates admin user with correct credentials
- Hashes password using bcrypt
- Verifies password after creation
- **Usage:**
  ```bash
  curl -X POST https://habesha-erp.vercel.app/api/ensure-admin \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@vanityhub.com","password":"Admin33#"}'
  ```

#### `/api/test-admin-login` (POST)
- Tests the complete login flow
- Validates input
- Checks user exists and is active
- Verifies password
- Returns detailed step-by-step results
- **Usage:**
  ```bash
  curl -X POST https://habesha-erp.vercel.app/api/test-admin-login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@vanityhub.com","password":"Admin33#"}'
  ```

### 2. Configuration Improvements
- Updated `vercel.json` with proper function configuration
- Added production logging to Prisma client
- Environment variables verified in Vercel dashboard

## Deployment Steps

### Option 1: Manual Deployment via Vercel Dashboard (RECOMMENDED)
1. Go to https://vercel.com/vanityerp/habesha-erp
2. Click "Deployments" tab
3. Find the latest commit (should be "feat: add comprehensive admin user management...")
4. Click "Redeploy" button
5. Wait for deployment to complete (~2-3 minutes)

### Option 2: Fix Git Author and Re-push
```bash
# Update git author
git config user.email "your-vercel-email@example.com"

# Amend last commit with new author
git commit --amend --reset-author --no-edit

# Force push
git push --force-with-lease
```

### Option 3: Use Vercel CLI (if manual deployment fails)
```bash
# Pull latest env vars
vercel env pull .env.production

# Deploy
vercel --prod --force
```

## Verification Steps

After deployment completes, run these commands in PowerShell:

### 1. Check Database Connection
```powershell
Invoke-RestMethod -Uri "https://habesha-erp.vercel.app/api/check-db"
```

### 2. Create/Update Admin User
```powershell
$body = @{
    email = "admin@vanityhub.com"
    password = "Admin33#"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://habesha-erp.vercel.app/api/ensure-admin" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 3. Test Admin Login Flow
```powershell
$body = @{
    email = "admin@vanityhub.com"
    password = "Admin33#"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://habesha-erp.vercel.app/api/test-admin-login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 4. Try Logging In
Open https://habesha-erp.vercel.app/login and use:
- **Email:** admin@vanityhub.com
- **Password:** Admin33#

## Automated Test Script

Run the PowerShell test script:
```powershell
.\scripts\test-production-login.ps1
```

## Environment Variables Required

Ensure these are set in Vercel (https://vercel.com/vanityerp/habesha-erp/settings/environment-variables):

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - https://habesha-erp.vercel.app
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `ADMIN_EMAIL` - admin@vanityhub.com (optional, defaults used in code)
- `ADMIN_PASSWORD` - Admin33# (optional, defaults used in code)

## Troubleshooting

### If API still returns 404 after deployment:
1. Check deployment logs in Vercel dashboard
2. Verify the build succeeded
3. Check that files exist in deployment:
   - `app/api/ensure-admin/route.ts`
   - `app/api/test-admin-login/route.ts`
   - `app/api/check-db/route.ts`

### If password doesn't work:
1. Run `/api/ensure-admin` POST endpoint to reset password
2. Check Vercel logs for authentication errors
3. Verify bcrypt is working (check logs for "Password verification: SUCCESS")

### If database connection fails:
1. Check `DATABASE_URL` environment variable
2. Verify Supabase database is accessible
3. Check Prisma client can connect

## Current Admin Credentials

After running the fix:
- **Email:** admin@vanityhub.com
- **Password:** Admin33#
- **Login URL:** https://habesha-erp.vercel.app/login

## Next Steps After Login Works

1. Change admin password through the UI
2. Create staff profile for admin user (if needed)
3. Set up proper role-based access control
4. Add additional admin users if needed

## Files Modified/Created

- ✅ `app/api/ensure-admin/route.ts` - Admin user management endpoint
- ✅ `app/api/test-admin-login/route.ts` - Login testing endpoint
- ✅ `lib/prisma.ts` - Added production logging
- ✅ `vercel.json` - Improved function configuration
- ✅ `scripts/test-production-login.ps1` - Automated testing script
- ✅ This guide

## Security Notes

1. The `/api/ensure-admin` and `/api/test-admin-login` endpoints should be **disabled or protected** after fixing the issue
2. Consider adding API authentication for these sensitive endpoints
3. Never commit production credentials to git
4. Use strong passwords in production
