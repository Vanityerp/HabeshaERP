# Production Data Migration Guide

## 🎯 Objective
Ensure all development data (locations, staff, services, products, clients) is correctly migrated to the production database and loads correctly in production.

## ⚠️ Common Issue
In previous deployments, data was not loading because:
1. Database was not seeded with production data
2. Data existed but relationships (associations) were missing
3. API routes were failing silently

## ✅ Solution: Complete Data Migration Checklist

### Step 1: Pre-Migration Verification

**Check if data already exists in production:**

```bash
# Option 1: Check via API (if deployed)
curl https://habesha-erp.vercel.app/api/status

# Option 2: Run verification script locally (pointing to production DB)
export DATABASE_URL="your-production-database-url"
export DIRECT_URL="your-production-direct-url"
npx tsx scripts/verify-production-data.ts
```

**Expected Results:**
- ✅ 5 locations
- ✅ 22+ staff members
- ✅ 144+ services
- ✅ 576+ service-location associations
- ✅ 27+ staff-location assignments

### Step 2: Seed Production Database

**If data is missing, run seeding:**

#### Method 1: Via API Endpoint (After Deployment)

```bash
# Call the seeding endpoint
curl -X POST https://habesha-erp.vercel.app/api/seed-production \
  -H "Content-Type: application/json" \
  -d '{"skipIfExists": true}'
```

This endpoint will:
- Create admin user (if not exists)
- Create 5 locations (if not exists)
- Create 144+ services (if not exists)
- Create 22+ staff members (if not exists)
- Create all relationships (LocationService, StaffLocation, etc.)

#### Method 2: Run Prisma Seed Script Locally

```bash
# Set production database URLs
export DATABASE_URL="postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=30"
export DIRECT_URL="postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Run seed script
npx tsx prisma/seed.ts
```

### Step 3: Verify Data Migration

**After seeding, verify all data exists:**

```bash
# Run verification script
npx tsx scripts/verify-production-data.ts
```

**Expected Output:**
```
✅ Found 5 locations
✅ Found 22 active staff members
✅ Found 144 active services
✅ Found 576 service-location associations
✅ Found 27 staff-location associations
✅ Found X clients
✅ Found X active products
✅ Admin user exists
```

### Step 4: Test Data Loading in Production

**After deployment, test these endpoints:**

1. **Locations API:**
   ```
   GET https://habesha-erp.vercel.app/api/locations
   ```
   Should return 5 locations

2. **Staff API:**
   ```
   GET https://habesha-erp.vercel.app/api/staff
   ```
   Should return 22+ staff members

3. **Services API:**
   ```
   GET https://habesha-erp.vercel.app/api/services
   ```
   Should return 144+ services

4. **Products API:**
   ```
   GET https://habesha-erp.vercel.app/api/products
   ```
   Should return products (if seeded)

### Step 5: Verify Frontend Data Loading

**In production, check:**

1. ✅ Login page works
2. ✅ Dashboard loads
3. ✅ **Locations dropdown shows 5 locations**
4. ✅ **Staff menu shows 22+ staff members**
5. ✅ **Services menu shows 144+ services**
6. ✅ **Can create appointments** (services are linked to locations)
7. ✅ **Can assign staff** (staff are linked to locations)
8. ✅ Products are visible (if products were seeded)

## 🔍 Troubleshooting Data Loading Issues

### Issue 1: APIs Return Empty Arrays

**Symptoms:**
- `/api/locations` returns `{ locations: [] }`
- `/api/staff` returns `{ staff: [] }`
- `/api/services` returns `{ services: [] }`

**Solution:**
1. Database is not seeded - Run seeding script
2. Check database connection - Verify `DATABASE_URL` is correct
3. Check Vercel Function Logs for errors

### Issue 2: Data Exists But Not Loading

**Symptoms:**
- Database has data (verified via Prisma Studio)
- But APIs return empty arrays
- Frontend shows "No locations" or "No staff"

**Possible Causes:**
1. **Access Control Filtering**
   - Check if user has proper role/permissions
   - Admin users should see all data
   - Staff users may see filtered data

2. **Database Query Issues**
   - Check `isActive` filters
   - Verify relationships are correct
   - Check for `where` clause issues

3. **API Route Errors**
   - Check Vercel Function Logs
   - Look for Prisma errors
   - Check for connection timeouts

**Solution:**
```bash
# Check Vercel Function Logs
# Look for errors in:
# - /api/locations
# - /api/staff
# - /api/services

# Test APIs directly
curl https://habesha-erp.vercel.app/api/locations
curl https://habesha-erp.vercel.app/api/staff
curl https://habesha-erp.vercel.app/api/services
```

### Issue 3: Relationships Missing

**Symptoms:**
- Locations exist but services don't show
- Staff exist but can't be assigned to locations
- Services exist but not linked to locations

**Solution:**
- Run seeding script again (it will create relationships)
- Check `LocationService` table has data
- Check `StaffLocation` table has data

```bash
# Re-run seeding (it will skip existing data but create relationships)
curl -X POST https://habesha-erp.vercel.app/api/seed-production \
  -H "Content-Type: application/json" \
  -d '{"skipIfExists": false}'
```

## 📋 Post-Migration Checklist

After migration, verify:

- [ ] All 5 locations visible in dropdown
- [ ] All 22+ staff members visible in staff menu
- [ ] All 144+ services visible in services menu
- [ ] Can create appointments (services are linked)
- [ ] Can assign staff to appointments (staff are linked)
- [ ] Products visible (if products were seeded)
- [ ] Client list loads (if clients exist)
- [ ] No console errors in browser
- [ ] No API errors in Vercel Function Logs

## 🚀 Quick Migration Command

For quick migration, run this after deployment:

```bash
# 1. Seed production database
curl -X POST https://habesha-erp.vercel.app/api/seed-production \
  -H "Content-Type: application/json" \
  -d '{"skipIfExists": true}'

# 2. Verify data
curl https://habesha-erp.vercel.app/api/status

# 3. Test APIs
curl https://habesha-erp.vercel.app/api/locations
curl https://habesha-erp.vercel.app/api/staff
curl https://habesha-erp.vercel.app/api/services
```

## 📝 Notes

- The seeding script is **idempotent** - safe to run multiple times
- It uses `skipIfExists: true` by default to avoid duplicates
- Relationships (associations) are created automatically
- All data from `prisma/seed.ts` will be migrated

---

**Last Updated:** $(date)
**Status:** ✅ Ready for Production Data Migration

