# Diagnose Vercel Deployment Issues

## 🔍 Current Symptoms

- ✅ Login works (authentication successful)
- ✅ Page loads (Next.js app is running)
- ❌ "No locations" message
- ❌ Data not loading in dropdowns
- ❌ Calendar shows only one staff member

## 🔧 Step-by-Step Diagnosis

### 1. Check Vercel Environment Variables (MOST COMMON ISSUE)

Go to: https://vercel.com/dashboard → habesha-erp → Settings → Environment Variables

**Verify ALL 8 variables are set:**

| Variable | Expected Value | Check |
|----------|---------------|-------|
| NEXTAUTH_SECRET | `a57b39e1af704dc...` | [ ] |
| NEXTAUTH_URL | `https://habesha-erp.vercel.app` | [ ] |
| DATABASE_URL | `postgresql://neondb_owner...pooler...` (has `-pooler`) | [ ] |
| DIRECT_URL | `postgresql://neondb_owner...` (NO `-pooler`) | [ ] |
| NODE_ENV | `production` | [ ] |
| USE_MOCK_DATA | `false` | [ ] |
| SKIP_DB_CONNECTION | `false` | [ ] |
| NODE_TLS_REJECT_UNAUTHORIZED | `0` | [ ] |

**If ANY are missing:** Add them and redeploy!

### 2. Check Vercel Function Logs

1. Go to: https://vercel.com/dashboard
2. Select your project: **habesha-erp**
3. Click on **Deployments** tab
4. Click on the latest deployment
5. Click **View Function Logs**

**Look for:**
- ❌ Database connection errors
- ❌ "DATABASE_URL is not defined"
- ❌ "Cannot connect to database"
- ❌ Prisma errors

**Copy any errors you see and check the solutions below.**

### 3. Test API Endpoints Directly

Open these URLs in your browser (while logged in):

1. `https://habesha-erp.vercel.app/api/locations`
   - **Expected:** JSON with 5 locations
   - **If error:** Check what the error says

2. `https://habesha-erp.vercel.app/api/staff`
   - **Expected:** JSON with 22 staff members
   - **If error:** Note the error message

3. `https://habesha-erp.vercel.app/api/services`
   - **Expected:** JSON with 144 services
   - **If error:** Note the error message

**What do you see?**
- If you see JSON data → Frontend issue
- If you see errors → API/Database issue

### 4. Check Database Connection

Run this locally to verify database is accessible:

```powershell
node verify-neon-data.js
```

**Expected output:**
```
✓ 25 Users
✓ 22 Staff Members
✓ 5 Locations
✓ 144 Services
```

**If this works locally but not in Vercel:**
→ Environment variables are not set correctly in Vercel

## 🐛 Common Issues & Solutions

### Issue 1: "No locations" but login works

**Cause:** Environment variables not set in Vercel

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Add ALL 8 variables listed above
3. Make sure they're set for "Production" environment
4. Click "Redeploy" after adding them

**Time: 5 minutes**

### Issue 2: API returns "Database connection failed"

**Cause:** DATABASE_URL not set or incorrect

**Solution:**
1. Verify `DATABASE_URL` exists in Vercel
2. Check it has `-pooler` in the hostname
3. Verify it has `sslmode=require` at the end
4. Check Neon database is not paused (visit console.neon.tech)

**Time: 2 minutes**

### Issue 3: Build succeeded but no data loads

**Cause:** Runtime environment variables missing

**Solution:**
1. Environment variables might be set for "Preview" instead of "Production"
2. Go to Environment Variables in Vercel
3. Make sure each variable shows "Production" tag
4. If not, delete and re-add for Production
5. Redeploy

**Time: 5 minutes**

### Issue 4: "Failed to fetch" errors in console

**Cause:** API routes returning 500 errors

**Solution:**
1. Check Vercel Function Logs for actual error
2. Usually means DATABASE_URL or DIRECT_URL is missing
3. Add both variables with correct values
4. Redeploy

**Time: 3 minutes**

## 📋 Quick Verification Checklist

Before asking for help, verify:

- [ ] All 8 environment variables are added in Vercel
- [ ] Each variable is set for "Production" environment
- [ ] DATABASE_URL has `-pooler` in hostname
- [ ] DIRECT_URL does NOT have `-pooler` in hostname
- [ ] NEXTAUTH_URL matches your actual deployment URL
- [ ] You redeployed AFTER adding environment variables
- [ ] Deployment succeeded (no build errors)
- [ ] You tested API endpoints directly (URLs in Step 3 above)

## 🎯 Most Likely Solution

**90% of the time, the issue is:**

1. Environment variables not added to Vercel yet
2. Variables added but didn't redeploy
3. Variables set for "Preview" instead of "Production"

**Fix:**
1. Go to Vercel Settings → Environment Variables
2. Add all 8 variables for "Production"
3. Click Deployments → Latest → Redeploy
4. Wait 2-3 minutes
5. Test again

## 📞 If Still Not Working

1. **Copy the error from Vercel Function Logs**
2. **Take screenshot of Environment Variables page**
3. **Test these URLs and note results:**
   - https://habesha-erp.vercel.app/api/locations
   - https://habesha-erp.vercel.app/api/staff
   
4. **Share:**
   - What error appears in Function Logs
   - What you see when visiting the API URLs
   - Screenshot showing environment variables are set

## ⏱️ Estimated Fix Time

- If env vars missing: 5 minutes
- If env vars incorrect: 3 minutes
- If Neon database paused: 1 minute
- If other issue: 10-15 minutes

---

**Most Common Fix: Add environment variables in Vercel and redeploy!**
