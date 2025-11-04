# Production Readiness Checklist - HabeshaERP

## ✅ Pre-Deployment Verification

### 1. Environment Variables (CRITICAL)
All these MUST be set in Vercel Dashboard → Settings → Environment Variables → Production:

#### Required Variables:
- ✅ `NEXTAUTH_SECRET` - Authentication secret key
- ✅ `NEXTAUTH_URL` - Production URL (e.g., `https://habesha-erp.vercel.app`)
- ✅ `DATABASE_URL` - Pooled PostgreSQL connection (must have `-pooler` in hostname)
- ✅ `DIRECT_URL` - Direct PostgreSQL connection (must NOT have `-pooler`)
- ✅ `NODE_ENV` - Set to `production`
- ✅ `USE_MOCK_DATA` - Set to `false`
- ✅ `SKIP_DB_CONNECTION` - Set to `false`

#### Optional but Recommended:
- `NODE_TLS_REJECT_UNAUTHORIZED` - Set to `0` for Neon database
- `REDIS_URL` or `UPSTASH_REDIS_REST_URL` - For Redis caching (optional, has fallback)
- `UPSTASH_REDIS_REST_TOKEN` - Redis token if using Upstash

### 2. Database Configuration
- ✅ Prisma schema configured to use `DIRECT_URL` in production
- ✅ Database connection pooling configured correctly
- ✅ SSL mode set to `require` for Neon database
- ✅ Connection timeouts configured (10s maxWait, 30s timeout)

### 3. Redis Configuration
- ✅ Redis client has graceful fallback if not configured
- ✅ Session storage uses Redis if available, falls back to JWT
- ✅ No hardcoded Redis URLs - all via environment variables

### 4. Authentication
- ✅ NextAuth configured with `trustHost: true` for Vercel
- ✅ Secure cookies enabled in production
- ✅ Session strategy: JWT (works without Redis)
- ✅ Redis adapter optional (only if Redis is configured)

### 5. Build Configuration
- ✅ `vercel.json` has correct build command: `prisma generate && next build`
- ✅ Prisma generate runs before build
- ✅ Server external packages configured: `prisma`, `@prisma/client`, `bcryptjs`
- ✅ Image optimization configured for Vercel storage

### 6. API Routes
- ✅ All API routes handle database connection errors gracefully
- ✅ Error responses include proper HTTP status codes
- ✅ Production errors don't expose sensitive information
- ✅ Database connection errors return 503 (Service Unavailable)

### 7. Code Quality
- ✅ No hardcoded localhost URLs
- ✅ No hardcoded development URLs
- ✅ All environment variables checked at runtime
- ✅ Proper error logging without exposing secrets

## 📋 Deployment Steps

### Step 1: Set Environment Variables in Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all required variables listed above
5. Ensure each is set for "Production" environment

### Step 2: Verify Database Connection & Data Migration (CRITICAL)

**⚠️ IMPORTANT: This step ensures all your development data is in production!**

#### Option A: Verify Data Already Exists
1. Visit your production URL: `https://habesha-erp.vercel.app/api/status`
2. Check the response - it should show:
   - `locationCount: 5` (or more)
   - `productCount: > 0`
   - Database `connected: true`

#### Option B: Seed Production Database (If Data Missing)

If data is missing, seed the production database:

1. **Method 1: Via API Endpoint (Recommended)**
   ```bash
   # After deployment, call the seeding endpoint
   curl -X POST https://habesha-erp.vercel.app/api/seed-production \
     -H "Content-Type: application/json" \
     -d '{"skipIfExists": true}'
   ```

2. **Method 2: Run Prisma Seed Locally (Pointing to Production DB)**
   ```bash
   # Set production DATABASE_URL temporarily
   export DATABASE_URL="your-production-database-url"
   export DIRECT_URL="your-production-direct-url"
   npx tsx prisma/seed.ts
   ```

3. **Verify Data After Seeding:**
   ```bash
   # Run verification script
   npx tsx scripts/verify-production-data.ts
   ```

**Expected Data After Seeding:**
- ✅ **5 Locations**: D-ring road, Muaither, Medinat Khalifa, Home Service, Online Store
- ✅ **22+ Staff Members**: Complete staff with HR data and location assignments
- ✅ **144+ Services**: All salon services with location associations
- ✅ **576+ Service-Location Associations**: Services linked to locations
- ✅ **27+ Staff-Location Assignments**: Staff assigned to locations
- ✅ **Admin User**: admin@vanityhub.com (password: Admin33#)
- ✅ **Products**: All products from development (if seeded)

#### Critical Data Verification Checklist:
- [ ] Locations dropdown shows 5 locations
- [ ] Staff menu shows 22+ staff members
- [ ] Services menu shows 144+ services
- [ ] Can create appointments (services are linked to locations)
- [ ] Can assign staff to appointments (staff are linked to locations)
- [ ] Products are visible (if products were seeded)
- [ ] Admin can login successfully

### Step 3: Deploy
1. Push code to GitHub (triggers automatic deployment)
2. OR manually redeploy from Vercel dashboard
3. Monitor build logs for any errors

### Step 4: Post-Deployment Verification
1. ✅ Login works with admin credentials
2. ✅ Dashboard loads with data
3. ✅ Locations dropdown shows all locations
4. ✅ Staff menu shows all staff members
5. ✅ Services menu shows all services
6. ✅ Can create new records (clients, appointments, etc.)
7. ✅ Data persists after page refresh

## 🔍 Troubleshooting

### Build Fails
- Check that `DIRECT_URL` is set (required for Prisma migrations)
- Verify `prisma generate` runs successfully
- Check build logs for specific errors

### Runtime Errors
- Check Vercel Function Logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure database is not paused (for Neon)
- Check Redis connection if using Redis features

### "No data" or "Failed to fetch"
- Most common: Missing or incorrect `DATABASE_URL`
- Check that `USE_MOCK_DATA=false`
- Verify `SKIP_DB_CONNECTION=false`
- Check API route logs for connection errors
- **NEW ISSUE**: Database not seeded - Run `/api/seed-production` endpoint
- Verify data exists: Check `/api/status` endpoint for counts

### Data Not Loading (Locations/Staff/Services Empty)
**This is the most common production issue!**

**Symptoms:**
- Locations dropdown is empty
- Staff list is empty
- Services list is empty
- Products list is empty

**Root Causes & Solutions:**

1. **Database Not Seeded**
   - Solution: Run seeding endpoint
   - `POST https://your-app.vercel.app/api/seed-production`
   - Or run `npx tsx prisma/seed.ts` with production DATABASE_URL

2. **Database Connection Failing**
   - Check Vercel Function Logs for connection errors
   - Verify `DATABASE_URL` and `DIRECT_URL` are set correctly
   - Ensure database is not paused (Neon)

3. **API Routes Returning Empty Arrays**
   - Check `/api/locations` - should return 5 locations
   - Check `/api/staff` - should return 22+ staff
   - Check `/api/services` - should return 144+ services
   - If APIs return empty, database is not seeded

4. **Data Migration Not Completed**
   - Verify data exists in database: Run `scripts/verify-production-data.ts`
   - Check Prisma Studio: `npx prisma studio` (connect to production DB)
   - Ensure all relationships are created (LocationService, StaffLocation, etc.)

**Quick Fix:**
```bash
# 1. Verify data exists
curl https://your-app.vercel.app/api/status

# 2. If data missing, seed it
curl -X POST https://your-app.vercel.app/api/seed-production \
  -H "Content-Type: application/json" \
  -d '{"skipIfExists": true}'

# 3. Verify again
curl https://your-app.vercel.app/api/status
```

### Login Issues
- Verify `NEXTAUTH_URL` matches your actual deployment URL
- Check `NEXTAUTH_SECRET` is set correctly
- Ensure cookies are working (check browser console)

## ✅ Success Indicators

After successful deployment:
- Build completes without errors
- All API endpoints return data (not errors)
- Authentication works for all user roles
- Data persists across sessions
- No console errors in browser
- All features functional (appointments, inventory, sales, etc.)

## 🎯 Quick Reference

**Admin Login:**
- Email: `admin@vanityhub.com`
- Password: `Admin33#`

**Manager Login:**
- Email: `Tsedey@habeshasalon.com`
- Password: `Admin33#`

**Production URL:**
- https://habesha-erp.vercel.app (or your custom domain)

---

**Last Updated:** $(date)
**Status:** ✅ Ready for Production Deployment

