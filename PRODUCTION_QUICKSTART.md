# Production Quickstart Checklist ✅

## What's Already Done ✓

- ✅ Database (Neon PostgreSQL) is set up
- ✅ Database is fully seeded with:
  - 25 users (1 admin, 23 staff, 2 clients)
  - 5 locations
  - 144 services
  - 23 staff members with complete data
- ✅ All migrations applied
- ✅ Schema is up to date

## What You Need to Do Now

### 1. Set Vercel Environment Variables (5 minutes)

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add these (Production environment):**

```
NEXTAUTH_SECRET=a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9
NEXTAUTH_URL=https://habesha-pos.vercel.app

# Database URLs (both required)
DATABASE_URL=postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=30
DIRECT_URL=postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Application config
NODE_ENV=production
USE_MOCK_DATA=false
SKIP_DB_CONNECTION=false
```

⚠️ **IMPORTANT**: Update `NEXTAUTH_URL` to your actual Vercel URL!

### 2. Redeploy (2 minutes)

1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for completion

### 3. Test (2 minutes)

Visit: https://habesha-pos.vercel.app/login

**Login with:**
- Email: `admin@vanityhub.com`
- Password: `Admin33#`

**Verify:**
- ✅ Dashboard loads
- ✅ Staff menu shows 23 staff
- ✅ Locations dropdown shows 5 locations
- ✅ Services menu shows 144 services

### 4. Test Data Persistence (3 minutes)

1. Create a new client
2. Refresh page
3. ✅ Client should still be there

**If everything works → You're done! 🎉**

## If Something Doesn't Work

See detailed troubleshooting in: `VERCEL_PRODUCTION_SETUP.md`

Common issues:
- **"No locations"** → Check Vercel env vars are set
- **Login fails** → Check NEXTAUTH_URL matches your deployment URL
- **Data empty** → Database is seeded, check DATABASE_URL is correct

## Quick Reference

**Admin Login:** admin@vanityhub.com / Admin33#
**Manager Login:** Tsedey@habeshasalon.com / Admin33#
**Staff Login:** Any staff email / Admin33#

**Database:** Neon PostgreSQL (shared dev/production)
**Locations:** D-ring road, Muaither, Medinat Khalifa, Home Service, Online Store
**Staff Count:** 23 real staff members
**Services Count:** 144 services across 10 categories

---

**Total Setup Time: ~10-12 minutes**
