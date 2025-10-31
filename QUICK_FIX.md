# Quick Fix for Vercel Login Issue

## The Problem
Login shows "Invalid email or password" on https://habesha-erp.vercel.app

## The Root Cause
**Vercel doesn't have the DATABASE_URL environment variable**, so it can't connect to your Supabase PostgreSQL database where the admin user exists.

## The Solution (5 minutes)

### Step 1: Go to Vercel Environment Variables
Open this link in your browser:
```
https://vercel.com/vanityerp/habesha/settings/environment-variables
```

### Step 2: Add DATABASE_URL

Click "Add New" and enter:

**Key:** `DATABASE_URL`

**Value:** 
```
postgres://postgres.dzdgtmebfgdvglgldlph:jFq87cdhsdJnkigC@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Environment:** Select all three (Production, Preview, Development)

Click **Save**

### Step 3: Verify Other Environment Variables Exist

Make sure these are also set (they should already be there):

**NEXTAUTH_SECRET:** `a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9`

**NEXTAUTH_URL:** `https://habesha-erp.vercel.app`

If they're missing, add them.

### Step 4: Redeploy

1. Go to the **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. **Uncheck** "Use existing Build Cache"
5. Click **"Redeploy"**

Wait 2-3 minutes for the deployment to complete.

### Step 5: Login

Once deployment is complete, go to:
```
https://habesha-erp.vercel.app/login
```

**Email:** `admin@vanityhub.com`  
**Password:** `Admin33#`

---

## Why This Works

Your local environment works because it reads from `.env` file which has the DATABASE_URL.

Vercel deployments don't have access to your local `.env` file - they need environment variables set through the Vercel dashboard.

Without DATABASE_URL, Vercel can't connect to the database where the admin user exists, so all logins fail.

---

## If It Still Doesn't Work

1. **Check Vercel Function Logs:**
   - Go to Deployments → Latest → "View Function Logs"
   - Look for database connection errors

2. **Verify the environment variables are set:**
   - Run in terminal: `vercel env ls`
   - Should show DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

3. **Clear Vercel cache completely:**
   - Settings → General → scroll down
   - Click "Clear Build Cache"
   - Redeploy again

---

## Current Database Status

✅ Database is seeded and ready with:
- Admin user: admin@vanityhub.com / Admin33#
- 20 staff members
- 5 locations  
- 144 services

The data is in Supabase PostgreSQL. Vercel just needs the connection string to access it.
