# Vercel Production Setup - Complete Guide

## ✅ Database Status

Your Neon database is now fully seeded with:
- **25 users** (1 admin, 23 staff, 2 sample clients)
- **5 locations** (D-ring road, Muaither, Medinat Khalifa, Home Service, Online Store)
- **144 services** across 10 categories
- **576 location-service associations**
- **23 staff members** with complete HR data

## 🔧 Vercel Environment Variables Setup

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Select your project: **habesha-erp** (or your project name)
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add/Update These Environment Variables

**CRITICAL: Add these EXACT values to Production environment**

```env
# Authentication (REQUIRED)
NEXTAUTH_SECRET=a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9
NEXTAUTH_URL=https://habesha-pos.vercel.app

# Database - Neon PostgreSQL (REQUIRED)
DATABASE_URL=postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&connection_limit=10&pool_timeout=30

# Direct connection for migrations (REQUIRED)
DIRECT_URL=postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Application Config (REQUIRED)
NODE_ENV=production
USE_MOCK_DATA=false
SKIP_DB_CONNECTION=false

# Neon Database Specific (OPTIONAL but recommended)
PGHOST=ep-crimson-lake-agstmll3-pooler.c-2.eu-central-1.aws.neon.tech
PGHOST_UNPOOLED=ep-crimson-lake-agstmll3.c-2.eu-central-1.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_o5bQaY4wdfFu

# SSL Configuration (OPTIONAL)
NODE_TLS_REJECT_UNAUTHORIZED=0

# Neon Auth (OPTIONAL - if using Neon auth features)
NEXT_PUBLIC_STACK_PROJECT_ID=6b04d40a-46cf-49c5-aa98-8020bb35a12c
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_01nd2s2vjhrswbrzxxze11wsn086tynfk07xs6tjq6v1g
STACK_SECRET_SERVER_KEY=ssk_8s1edtbkwxhthp9kyxkybca89pcwcrkjjskspsn1xk4ng
```

### Step 3: Important Notes for Each Variable

1. **NEXTAUTH_URL**: 
   - Update to your ACTUAL Vercel deployment URL
   - Example: `https://habesha-pos.vercel.app` or `https://your-app.vercel.app`
   - ⚠️ This MUST match your deployment URL exactly

2. **DATABASE_URL**:
   - Uses connection pooling (`-pooler` endpoint)
   - Includes connection limits to prevent "too many connections" errors
   - This is the SAME database you just seeded locally

3. **Environment Selection**:
   - Set all variables for **Production** environment
   - You can also set them for **Preview** and **Development** if needed

### Step 4: Redeploy Your Application

After adding/updating environment variables:

1. Go to **Deployments** tab
2. Click the **three dots (...)** on the latest deployment
3. Click **Redeploy**
4. Check "Use existing Build Cache" (optional, for faster deployment)
5. Click **Redeploy**
6. Wait 2-5 minutes for deployment to complete

## 🧪 Testing Your Production Deployment

### Step 1: Test Login

Visit your production URL: https://habesha-pos.vercel.app/login

**Admin Login:**
- Email: `admin@vanityhub.com`
- Password: `Admin33#`

**Manager Login:**
- Email: `Tsedey@habeshasalon.com`
- Password: `Admin33#`

**Staff Login (any of these):**
- `mekdes@habeshasalon.com` / `Admin33#`
- `aster@habeshasalon.com` / `Admin33#`
- `gelila@habeshasalon.com` / `Admin33#`

### Step 2: Verify Data Loading

After logging in, check:

✅ **Dashboard** - Should show metrics and data
✅ **Staff** menu - Should list 23 staff members
✅ **Clients** menu - Should show clients (start with 2 sample clients)
✅ **Services** menu - Should display 144 services
✅ **Inventory** menu - Should show products (if any seeded)
✅ **Locations** dropdown - Should show 5 locations

### Step 3: Test Data Persistence

1. **Create a new location:**
   - Go to Settings → Locations
   - Add a new location
   - Refresh the page
   - ✅ New location should still be there

2. **Create a new client:**
   - Go to Clients → Add Client
   - Fill in details and save
   - Check clients list
   - ✅ New client should appear

3. **Create an appointment:**
   - Go to Appointments → New Appointment
   - Select client, staff, service, date
   - Save appointment
   - ✅ Appointment should persist

## 🐛 Troubleshooting

### Problem: "No locations" message

**Solution:**
1. Check Vercel logs: Deployments → View Function Logs
2. Look for database connection errors
3. Verify `DATABASE_URL` is set correctly
4. Ensure database has been seeded (run locally: `npm run db:seed`)

### Problem: Login fails in production

**Solutions:**
1. Verify `NEXTAUTH_SECRET` matches exactly
2. Check `NEXTAUTH_URL` is your actual deployment URL (not localhost)
3. Clear browser cookies and try again
4. Check Vercel function logs for auth errors

### Problem: "Database connection failed"

**Solutions:**
1. Verify Neon database is accessible (not paused)
2. Check connection string has `sslmode=require`
3. Ensure pooling endpoint (`-pooler`) is used in Vercel
4. Check Neon dashboard for connection limits

### Problem: Data doesn't persist

**Solutions:**
1. Check API routes aren't throwing errors (Vercel logs)
2. Verify database writes are happening (check Neon logs)
3. Ensure `USE_MOCK_DATA=false` is set
4. Check browser console for API errors
5. Verify session/authentication is working

### Problem: "Too many connections" error

**Solutions:**
1. Ensure using pooled connection URL (`-pooler`)
2. Add connection limits in DATABASE_URL:
   ```
   ?sslmode=require&connection_limit=10&pool_timeout=30
   ```
3. Upgrade Neon plan if needed (free tier has connection limits)

## 📊 Database Management

### Viewing Data in Production

**Option 1: Prisma Studio (Local)**
```powershell
# Connect to production database
npm run db:studio
```
This opens Prisma Studio at http://localhost:5555 connected to your Neon database.

**Option 2: Neon Console**
1. Visit: https://console.neon.tech
2. Select your project
3. Go to SQL Editor
4. Run queries to view/edit data

**Option 3: Direct SQL Connection**
Use any PostgreSQL client with your connection string.

### Backing Up Data

```powershell
# Export data (Windows PowerShell)
$env:DATABASE_URL = "postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
npx prisma db seed > backup.sql
```

## ✅ Verification Checklist

Before considering production ready:

- [ ] All environment variables set in Vercel
- [ ] NEXTAUTH_URL updated to actual deployment URL
- [ ] Database seeded with data (25 users, 5 locations, 144 services)
- [ ] Can login with admin credentials
- [ ] Dashboard shows data (not empty)
- [ ] Staff list loads (23 staff members)
- [ ] Services list loads (144 services)
- [ ] Locations dropdown works (5 locations)
- [ ] Can create new location and it persists
- [ ] Can create new client and it persists
- [ ] Can create appointment and it persists
- [ ] Can create transaction and it persists
- [ ] No console errors in browser
- [ ] No function errors in Vercel logs

## 🎉 Success Indicators

Your production app is working correctly when:

1. ✅ Login works without errors
2. ✅ Dashboard shows metrics and charts
3. ✅ All menus load data (not empty)
4. ✅ Can create new records (locations, clients, appointments)
5. ✅ New records persist after page refresh
6. ✅ No "No locations" or "No data" messages
7. ✅ Vercel function logs show no errors

## 📞 Still Having Issues?

If problems persist after following this guide:

1. **Check Vercel Function Logs**:
   - Go to Deployments → Click on deployment → View Function Logs
   - Look for errors in the logs

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for red errors in Console tab
   - Check Network tab for failed API requests

3. **Verify Database Connection**:
   - Run locally: `npx prisma db execute --stdin --schema=prisma/schema.prisma`
   - Test query: `SELECT COUNT(*) FROM users;`
   - Should return 25 (or more if you've added users)

4. **Test API Endpoints**:
   - Visit: `https://your-app.vercel.app/api/locations`
   - Should return JSON with locations
   - If error, check what the error message says

## 📝 Notes

- Your local development and production now use the SAME Neon database
- Any changes you make locally will reflect in production
- Be careful when testing destructive operations
- Consider using a separate test database for development if needed

---

**Your production app should now be fully functional with all data loaded! 🎊**
