# Vercel Deployment Checklist for HabeshaERP

**Repository:** https://github.com/Vanityerp/HabeshaERP  
**Vercel Project:** https://vercel.com/vanityerps-projects

---

## 🚨 CRITICAL: What You Need to Provide

Since I cannot access Vercel directly, you'll need to provide the following:

### 1. **PostgreSQL Database URL** (REQUIRED)
You need a PostgreSQL database for production. Options:
- **Vercel Postgres** (recommended, easiest)
- **Supabase** (free tier available)
- **Neon** (serverless PostgreSQL)
- **Railway** (free tier available)

**Action Required:** Create a PostgreSQL database and get the connection URL in this format:
```
postgresql://username:password@host:port/database?sslmode=require
```

### 2. **Redis URL** (OPTIONAL but recommended)
For caching and better performance:
- **Upstash Redis** (free tier, works great with Vercel)
- **Redis Cloud** (free tier available)

**Action Required:** If you want Redis, get the connection URL:
```
redis://username:password@host:port
```

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Set Up Database (REQUIRED - You Must Do This)

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Click on "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Follow the prompts to create the database
6. Vercel will automatically add `POSTGRES_PRISMA_URL` to your environment variables

#### Option B: Supabase (Free Alternative)
1. Go to https://supabase.com
2. Create a new project
3. Go to Project Settings → Database
4. Copy the "Connection string" (URI format)
5. You'll add this as `DATABASE_URL` in Vercel

#### Option C: Neon (Serverless PostgreSQL)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. You'll add this as `DATABASE_URL` in Vercel

---

### Step 2: Configure Environment Variables in Vercel

Go to: https://vercel.com/vanityerps-projects/[your-project]/settings/environment-variables

Add these environment variables for **Production**, **Preview**, and **Development**:

#### Required Variables:
```env
# Database (use the PostgreSQL URL you got from Step 1)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Authentication
NEXTAUTH_SECRET=a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9
NEXTAUTH_URL=https://your-app-name.vercel.app

# Application Configuration
USE_MOCK_DATA=false
SKIP_DB_CONNECTION=false

# Prisma Configuration
PRISMA_GENERATE_DATAPROXY=false
```

#### Optional Variables (for better performance):
```env
# Redis (if you set it up)
REDIS_URL=redis://username:password@host:port

# Node Environment
NODE_ENV=production
```

**Important Notes:**
- Replace `your-app-name.vercel.app` with your actual Vercel URL
- If using Vercel Postgres, it will auto-add `POSTGRES_PRISMA_URL` - use that as `DATABASE_URL`
- Make sure to set these for ALL environments (Production, Preview, Development)

---

### Step 3: Update Prisma Schema for PostgreSQL

The current schema uses SQLite. I'll update it to support PostgreSQL for production.

**I can do this for you** - see the updated schema below.

---

### Step 4: Deploy to Vercel

#### Option A: Connect GitHub Repository (Recommended)
1. Go to https://vercel.com/vanityerps-projects
2. Click "Add New..." → "Project"
3. Import from GitHub: `Vanityerp/HabeshaERP`
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install --legacy-peer-deps`
5. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

### Step 5: Run Database Migrations (CRITICAL)

After the first deployment, you MUST run migrations to set up the database schema.

**Option A: Via Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Seed the database with initial data
npx prisma db seed
```

**Option B: Via Vercel Dashboard**
1. Go to your project in Vercel
2. Go to "Settings" → "Functions"
3. Add a serverless function to run migrations (I can create this for you)

---

### Step 6: Verify Deployment

After deployment, test these endpoints:

1. **Check Database Connection:**
   ```
   https://your-app.vercel.app/api/check-db
   ```
   Should return database stats

2. **Check Environment:**
   ```
   https://your-app.vercel.app/api/check-env
   ```
   Should show environment variables (masked)

3. **Test Login:**
   ```
   https://your-app.vercel.app/login
   ```
   Default credentials:
   - Email: `admin@vanityhub.com`
   - Password: `Admin33#`

---

## 🔧 What I Can Do For You

### ✅ I Can Prepare:
1. ✅ Update Prisma schema to support PostgreSQL
2. ✅ Create migration files
3. ✅ Update build configuration
4. ✅ Create deployment scripts
5. ✅ Update environment configuration files
6. ✅ Create database seed script for production

### ❌ I Cannot Do (You Must Do):
1. ❌ Create PostgreSQL database (you need to do this in Vercel/Supabase/Neon)
2. ❌ Set environment variables in Vercel dashboard
3. ❌ Click "Deploy" button in Vercel
4. ❌ Run migrations after deployment (requires your Vercel credentials)

---

## 📝 Current Configuration Status

### ✅ Already Configured:
- ✅ `vercel.json` exists with correct settings
- ✅ Build command configured
- ✅ Install command uses `--legacy-peer-deps`
- ✅ Function timeout set to 10 seconds
- ✅ Region set to `iad1` (US East)

### ⚠️ Needs Update:
- ⚠️ Prisma schema needs PostgreSQL provider (currently SQLite)
- ⚠️ Environment variables need to be set in Vercel
- ⚠️ Database needs to be created and migrated

---

## 🚀 Quick Start (What to Do Right Now)

### Step 1: Choose Your Database
Tell me which option you prefer:
- **Option A:** Vercel Postgres (easiest, integrated)
- **Option B:** Supabase (free, feature-rich)
- **Option C:** Neon (serverless, fast)

### Step 2: I'll Update the Code
Once you choose, I'll:
1. Update Prisma schema for PostgreSQL
2. Create production migration
3. Update build scripts
4. Create deployment helper scripts

### Step 3: You Deploy
You'll:
1. Create the database
2. Set environment variables in Vercel
3. Connect GitHub repo to Vercel
4. Click Deploy
5. Run migrations

---

## 📞 Next Steps

**Tell me:**
1. Which database provider do you want to use? (Vercel Postgres / Supabase / Neon)
2. Do you want Redis caching? (Yes / No)
3. Do you already have a Vercel project created, or should I guide you through creating one?

Once you answer these, I'll prepare all the necessary code updates and give you the exact commands to run!

---

## 🆘 Troubleshooting

### Common Issues:

**1. Build Fails with Prisma Error**
- Make sure `DATABASE_URL` is set in Vercel environment variables
- Ensure you're using PostgreSQL URL, not SQLite

**2. Login Doesn't Work**
- Run database migrations: `npx prisma migrate deploy`
- Run database seed: `npx prisma db seed`
- Check that admin user exists in database

**3. API Routes Return 500**
- Check Vercel function logs
- Verify database connection
- Ensure all environment variables are set

**4. "Module not found" Errors**
- Clear build cache in Vercel
- Redeploy with fresh build
- Check that `npm install --legacy-peer-deps` is used

---

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Ready to deploy? Let me know your database choice and I'll prepare everything!** 🚀

