# Vercel Production Deployment Instructions

## 🎯 Goal
Deploy Habesha ERP to Vercel with working authentication using the same credentials as development.

---

## ⚠️ IMPORTANT: Environment Variables Setup

The application **REQUIRES** these environment variables to be set in Vercel **BEFORE** deployment.

### Required Environment Variables

Set these in Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXTAUTH_SECRET` | `a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9` | Authentication secret (must match dev) |
| `NEXTAUTH_URL` | `https://habesha-erp.vercel.app` | Your production URL |
| `DATABASE_URL` | `postgres://postgres.dzdgtmebfgdvglgldlph:jFq87cdhsdJnkigC@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require` | Supabase PostgreSQL connection |
| `USE_MOCK_DATA` | `false` | Disable mock data |
| `SKIP_DB_CONNECTION` | `false` | Enable database connection |
| `NODE_ENV` | `production` | Set production mode |

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Select your project: `habesha-erp`

2. **Navigate to Settings**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Add Each Variable**
   - Click "Add New" button
   - Enter variable name (e.g., `NEXTAUTH_SECRET`)
   - Enter variable value (copy from table above)
   - Select environment: **Production** (check the box)
   - Click "Save"

4. **Repeat for All Variables**
   - Add all 6 variables from the table above
   - Make sure each is set for "Production" environment

### Step 2: Deploy to Production

**Option A: Automatic Deployment (Recommended)**
- Vercel automatically deploys when you push to GitHub
- Latest commit: `ee9d6e9` (Force Vercel redeploy)
- Just wait for the deployment to complete

**Option B: Manual Deployment**
1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" tab
3. Find the latest deployment
4. Click the three dots (⋮) menu
5. Click "Redeploy"
6. **IMPORTANT:** Uncheck "Use existing Build Cache"
7. Click "Redeploy"

### Step 3: Verify Deployment

1. **Check Build Status**
   - Go to Deployments tab
   - Wait for "Building" → "Completed"
   - Should take 2-5 minutes

2. **Check for Errors**
   - If build fails, check the build logs
   - Look for any missing environment variables
   - Look for any module resolution errors

3. **Test the Application**
   - Visit: https://habesha-erp.vercel.app
   - Should see the login page
   - No "error=Configuration" in URL

---

## 🔐 Login Credentials

### Admin Account
- **Email:** `admin@vanityhub.com`
- **Password:** `Admin33#`

### Manager Account (Tsedey)
- **Email:** `Tsedey@habeshasalon.com`
- **Password:** `Admin33#`

### All Staff Accounts
- **Password:** `Admin33#` (same for all)
- **Emails:** Check the staff list in the dashboard

---

## 🐛 Troubleshooting

### Issue 1: "error=Configuration" in Login URL

**Cause:** Missing or incorrect `NEXTAUTH_SECRET` or `NEXTAUTH_URL`

**Solution:**
1. Verify `NEXTAUTH_SECRET` is set correctly in Vercel
2. Verify `NEXTAUTH_URL` matches your production URL exactly
3. Redeploy after setting variables

### Issue 2: Cannot Login (Credentials Rejected)

**Cause:** Database not seeded or wrong password

**Solution:**
1. The database is already seeded with admin user
2. Make sure you're using: `admin@vanityhub.com` / `Admin33#`
3. Password is case-sensitive: `Admin33#` (capital A, capital A)

### Issue 3: Build Fails with "Module not found"

**Cause:** Vercel building from old commit or using cached build

**Solution:**
1. Go to Vercel Dashboard → Deployments
2. Find latest deployment (commit `ee9d6e9`)
3. Redeploy with "Use existing Build Cache" **UNCHECKED**

### Issue 4: Database Connection Error

**Cause:** Missing or incorrect `DATABASE_URL`

**Solution:**
1. Verify `DATABASE_URL` is set in Vercel
2. Make sure it includes `?sslmode=require` at the end
3. Test connection from Vercel logs

### Issue 5: "Internal Server Error" on Login

**Cause:** Database not accessible or Prisma client not generated

**Solution:**
1. Check Vercel build logs for Prisma errors
2. Verify `prisma generate` runs during build
3. Check `vercel.json` has correct build command

---

## ✅ Verification Checklist

Before testing login, verify:

- [ ] All 6 environment variables are set in Vercel
- [ ] Environment variables are set for "Production" environment
- [ ] Latest deployment is from commit `ee9d6e9` or later
- [ ] Build completed successfully (no errors)
- [ ] Deployment status shows "Ready"
- [ ] Production URL is accessible
- [ ] Login page loads without "error=Configuration"

---

## 📊 Expected Behavior

### Successful Deployment
1. ✅ Build completes in 2-5 minutes
2. ✅ No module resolution errors
3. ✅ Prisma generates successfully
4. ✅ All pages generated
5. ✅ Deployment shows "Ready"

### Successful Login
1. ✅ Visit https://habesha-erp.vercel.app
2. ✅ See login page (no error in URL)
3. ✅ Enter: `admin@vanityhub.com` / `Admin33#`
4. ✅ Click "Sign in"
5. ✅ Redirect to dashboard
6. ✅ See admin dashboard with all features

---

## 🔄 If You Need to Redeploy

1. **After Changing Environment Variables:**
   - Vercel automatically redeploys
   - Wait 2-5 minutes for build to complete

2. **After Pushing Code to GitHub:**
   - Vercel automatically detects and deploys
   - No manual action needed

3. **Manual Redeploy:**
   - Go to Deployments tab
   - Click three dots (⋮) on latest deployment
   - Click "Redeploy"
   - Uncheck "Use existing Build Cache"
   - Click "Redeploy"

---

## 📝 Notes

- **Same Database:** Dev and production use the same Supabase database
- **Same Credentials:** All users have password `Admin33#` in both environments
- **Same Secret:** `NEXTAUTH_SECRET` must match between dev and production
- **No Mock Data:** Production uses real data from database
- **Auto-Deploy:** Vercel automatically deploys on every GitHub push

---

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ Build completes without errors
2. ✅ Login page loads without "error=Configuration"
3. ✅ Can login with `admin@vanityhub.com` / `Admin33#`
4. ✅ Dashboard loads with all features
5. ✅ Can see 23 real staff members
6. ✅ Can see 144 real services
7. ✅ All pages are accessible
8. ✅ Client transaction tracking works

---

## 🆘 Need Help?

If you're still having issues:

1. **Check Vercel Build Logs:**
   - Go to Deployments → Click on deployment → View logs
   - Look for specific error messages

2. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify Environment Variables:**
   - Go to Settings → Environment Variables
   - Make sure all 6 variables are set
   - Make sure they're set for "Production"

4. **Try Fresh Deployment:**
   - Delete all environment variables
   - Re-add them one by one
   - Redeploy without cache

---

**Last Updated:** 2025-07-28  
**Latest Commit:** `ee9d6e9` - Force Vercel redeploy  
**Production URL:** https://habesha-erp.vercel.app

