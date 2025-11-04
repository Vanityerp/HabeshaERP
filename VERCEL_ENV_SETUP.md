# Vercel Environment Setup for habesha-erp.vercel.app

## ✅ Database Status - VERIFIED!

Your Neon database is fully loaded with:
- ✅ 25 Users (2 admins, 22 staff, 2 clients)
- ✅ 5 Locations (D-ring road, Muaither, Medinat Khalifa, Home Service, Online Store)
- ✅ 144 Services
- ✅ 576 Location-Service associations
- ✅ 27 Staff-Location assignments

**Admin Accounts:**
- admin@vanityhub.com
- Tsedey@habeshasalon.com

## 🔧 Required Vercel Environment Variables

Go to: https://vercel.com/dashboard → Your Project (habesha-erp) → Settings → Environment Variables

### Add These Variables for Production:

```env
NEXTAUTH_SECRET
a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9

NEXTAUTH_URL
https://habesha-erp.vercel.app

DATABASE_URL
postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=30

DIRECT_URL
postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

NODE_ENV
production

USE_MOCK_DATA
false

SKIP_DB_CONNECTION
false

NODE_TLS_REJECT_UNAUTHORIZED
0
```

## 📋 Step-by-Step Setup

### 1. Add Environment Variables (5 minutes)

For each variable above:
1. Click "Add New" in Environment Variables section
2. Enter the **Key** (e.g., `NEXTAUTH_SECRET`)
3. Enter the **Value** (e.g., `a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9`)
4. Select **Production** environment
5. Click "Save"

**CRITICAL NOTES:**
- `DATABASE_URL` must have `-pooler` in the hostname
- `DIRECT_URL` must NOT have `-pooler` in the hostname
- `NEXTAUTH_URL` must be `https://habesha-erp.vercel.app` (your actual URL)

### 2. Redeploy (2 minutes)

After adding all variables:
1. Go to **Deployments** tab
2. Click "..." menu on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### 3. Test the Deployment (3 minutes)

Visit: https://habesha-erp.vercel.app/login

**Login with:**
- Email: `admin@vanityhub.com`
- Password: `Admin33#`

**Verify:**
- ✅ Login succeeds
- ✅ Dashboard loads
- ✅ Locations dropdown shows 5 locations
- ✅ Staff menu shows 22 staff members
- ✅ Services menu shows 144 services
- ✅ Can create new client/appointment
- ✅ Data persists after refresh

## 🐛 Troubleshooting

### Error: "Failed to fetch categories"

**Cause:** Missing or incorrect DATABASE_URL

**Solution:**
1. Verify `DATABASE_URL` is set in Vercel
2. Check URL has `sslmode=require`
3. Ensure URL has `-pooler` in hostname
4. Redeploy after setting

### Error: "No locations"

**Cause:** Database connection not established

**Solution:**
1. Check all environment variables are set
2. Verify `USE_MOCK_DATA=false`
3. Verify `SKIP_DB_CONNECTION=false`
4. Check Vercel function logs for errors

### Error: "Cannot connect to database"

**Cause:** SSL configuration or Neon access issue

**Solution:**
1. Add `NODE_TLS_REJECT_UNAUTHORIZED=0`
2. Verify Neon database is not paused
3. Check connection string is correct
4. Test connection locally first

### Build Fails

**Cause:** Missing DIRECT_URL

**Solution:**
1. Add `DIRECT_URL` environment variable
2. Must be non-pooled connection (no `-pooler`)
3. Redeploy after adding

## 🔍 Verify Environment Variables

After adding variables, verify they're set correctly:

1. Go to Settings → Environment Variables
2. You should see all 8 variables listed
3. Each should show "Production" environment
4. Click "eye" icon to verify values match above

## ✅ Success Checklist

- [ ] Added all 8 environment variables
- [ ] DATABASE_URL has `-pooler` in URL
- [ ] DIRECT_URL does NOT have `-pooler`
- [ ] NEXTAUTH_URL is `https://habesha-erp.vercel.app`
- [ ] Redeployed after adding variables
- [ ] Deployment succeeded
- [ ] Can login with admin credentials
- [ ] Dashboard shows data
- [ ] All menus populate with data
- [ ] Can create new records

## 📊 Expected Results

After proper setup:
- Build time: ~2-3 minutes
- No build errors
- All API routes work
- Data loads from Neon database
- CRUD operations persist
- No "Failed to fetch" errors

## 🎯 Quick Copy-Paste for Vercel

Use these exact values when adding environment variables:

| Key | Value |
|-----|-------|
| NEXTAUTH_SECRET | `a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9` |
| NEXTAUTH_URL | `https://habesha-erp.vercel.app` |
| DATABASE_URL | `postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=30` |
| DIRECT_URL | `postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require` |
| NODE_ENV | `production` |
| USE_MOCK_DATA | `false` |
| SKIP_DB_CONNECTION | `false` |
| NODE_TLS_REJECT_UNAUTHORIZED | `0` |

---

**Total Setup Time: ~10 minutes to fully working production! 🎉**
### Optional: Redis/Vercel KV (for caching)

If you want to enable Redis-based caching (recommended for performance), add one of the following configurations:

Standard Redis:

```
REDIS_URL
redis://<user>:<password>@<host>:<port>

REDIS_PASSWORD
<password> (optional; only if not embedded in REDIS_URL)
```

Upstash/Vercel KV:

```
UPSTASH_REDIS_REST_URL
https://<your-upstash-url>

UPSTASH_REDIS_REST_TOKEN
<your-upstash-token>
```

Notes:
- Provide either `REDIS_URL` or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
- Redis is optional; if not configured, the app falls back to an in-memory cache.
- In production, TLS is configured automatically with `rejectUnauthorized: false` to avoid SSL issues.
