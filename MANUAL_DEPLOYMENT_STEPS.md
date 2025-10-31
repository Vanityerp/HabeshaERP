# Manual Vercel Deployment Steps

## Current Status
✅ Database is correctly configured with admin user (admin@vanityhub.com / Admin33#)
✅ All environment variables are set in Vercel
✅ Code is pushed to GitHub master branch
❌ Vercel hasn't deployed the latest code yet

## Solution: Manually Trigger Deployment

### Option 1: Via Vercel Dashboard (RECOMMENDED)

1. Go to: https://vercel.com/vanityerp/habesha-erp

2. Click on "Settings" tab

3. Click on "Git" in the left sidebar

4. Check "Production Branch" - **make sure it's set to `master`** (not `main`)
   - If it says `main`, change it to `master`
   - Click "Save"

5. Go to "Deployments" tab

6. Click "..." on any deployment → "Redeploy"
   - Uncheck "Use existing Build Cache"
   - Click "Redeploy"

### Option 2: Push an Empty Commit

```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin master
```

### Option 3: Via Vercel CLI (if you have proper permissions)

```bash
vercel --prod --force
```

## After Deployment Completes (2-3 minutes)

1. Visit: https://habesha-erp.vercel.app/api/check-db
   - Should return JSON with admin user info

2. Visit: https://habesha-erp.vercel.app/login
   - Email: admin@vanityhub.com
   - Password: Admin33#

## Verification Checklist

Before trying to login, verify these:

- [ ] Vercel "Production Branch" is set to `master`
- [ ] Latest deployment shows commit message: "Update DATABASE_URL and add quick fix guide" or newer
- [ ] Deployment status shows "Ready" (green checkmark)
- [ ] /api/check-db endpoint returns 200 OK (not 404)

## Why the Login Fails

The login fails because Vercel is either:
1. Still running an old deployment (before database fixes)
2. Watching the wrong branch (`main` instead of `master`)
3. Not automatically deploying on push

Once Vercel deploys the latest code with the correct DATABASE_URL environment variable, login will work immediately.

## Database Confirmation

Ran test script - production database status:
- ✅ Admin user exists
- ✅ Email: admin@vanityhub.com
- ✅ Password: Admin33# (verified working)
- ✅ Role: ADMIN
- ✅ Active: true
- ✅ Total users: 23

The database is ready. We just need Vercel to use it.
