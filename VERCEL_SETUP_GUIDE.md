# Complete Vercel Deployment Guide

## Step 1: Install Vercel CLI (if not already installed)

```powershell
npm install -g vercel
```

## Step 2: Login to Vercel

```powershell
vercel login
```

## Step 3: Deploy with Environment Variables

Run this command from your project directory:

```powershell
vercel --prod
```

When prompted, answer:
- Set up and deploy? **Y**
- Which scope? Select your account (vanityerps-projects)
- Link to existing project? **Y** (if habesha-bc exists) or **N** (to create new)
- Project name? **habesha-bc**

## Step 4: Set Environment Variables

After deployment, set these environment variables:

```powershell
vercel env add NEXTAUTH_SECRET production
# Paste: a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9

vercel env add NEXTAUTH_URL production
# Paste: https://habesha-bc.vercel.app

vercel env add DATABASE_URL production
# Paste: postgresql://postgres:jFq87cdhsdJnkigC@db.dzdgtmebfgdvglgldlph.supabase.co:5432/postgres?sslmode=require&connection_limit=20&pool_timeout=10

vercel env add DIRECT_URL production
# Paste: postgresql://postgres:jFq87cdhsdJnkigC@db.dzdgtmebfgdvglgldlph.supabase.co:5432/postgres
```

## Step 5: Redeploy with Environment Variables

```powershell
vercel --prod
```

## Alternative: Set via Vercel Dashboard

1. Go to: https://vercel.com/vanityerps-projects/habesha-bc/settings/environment-variables

2. Add each variable:
   - Click "Add New"
   - Name: `NEXTAUTH_SECRET`
   - Value: `a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9`
   - Environment: Select **Production**
   - Click "Save"

3. Repeat for:
   - `NEXTAUTH_URL` → `https://habesha-bc.vercel.app`
   - `DATABASE_URL` → `postgresql://postgres:jFq87cdhsdJnkigC@db.dzdgtmebfgdvglgldlph.supabase.co:5432/postgres?sslmode=require&connection_limit=20&pool_timeout=10`
   - `DIRECT_URL` → `postgresql://postgres:jFq87cdhsdJnkigC@db.dzdgtmebfgdvglgldlph.supabase.co:5432/postgres`

4. Go to: https://vercel.com/vanityerps-projects/habesha-bc/deployments
5. Click on the latest deployment
6. Click "..." → "Redeploy"
7. Uncheck "Use existing Build Cache"
8. Click "Redeploy"

## Step 6: Verify Deployment

After deployment completes (2-3 minutes):

```powershell
powershell -ExecutionPolicy Bypass -File test-production-login.ps1
```

## Step 7: Test Login

Go to: https://habesha-bc.vercel.app/login

Credentials:
```
Email: admin@vanityhub.com
Password: Admin2024
```

## Troubleshooting

### If "DEPLOYMENT_NOT_FOUND" error:
1. Make sure the project exists in your Vercel dashboard
2. Check that the GitHub repository is connected
3. Ensure the domain is correctly configured

### If still can't login:
1. Check Vercel logs: https://vercel.com/vanityerps-projects/habesha-bc/logs
2. Look for authentication errors
3. Verify all environment variables are set correctly

### Quick Deploy Option:

```powershell
# From project directory
vercel --prod
```

This will deploy using the existing configuration.
