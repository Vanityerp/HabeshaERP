# Production Setup Guide - Habesha ERP

## 🔐 CRITICAL: Fix Production Login Issue

### Why You Can't Login in Production

The login works in development but fails in production because **Vercel environment variables are not set correctly**.

### Step-by-Step Fix

#### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your project: **HabeshaERP**
- Click **Settings** tab
- Click **Environment Variables** in left sidebar

#### 2. Add These Environment Variables

**CRITICAL - Authentication:**
```
Key: NEXTAUTH_SECRET
Value: a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9
Environment: Production
```

```
Key: NEXTAUTH_URL  
Value: https://habesha-erp.vercel.app
Environment: Production
```
⚠️ **IMPORTANT:** Replace `https://habesha-erp.vercel.app` with your ACTUAL Vercel deployment URL!

**CRITICAL - Database:**
```
Key: DATABASE_URL
Value: postgres://postgres.dzdgtmebfgdvglgldlph:jFq87cdhsdJnkigC@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
Environment: Production
```

**Application Config:**
```
Key: USE_MOCK_DATA
Value: false
Environment: Production
```

```
Key: SKIP_DB_CONNECTION
Value: false
Environment: Production
```

```
Key: NODE_ENV
Value: production
Environment: Production
```

#### 3. Redeploy

After adding all environment variables:
1. Go to **Deployments** tab
2. Click the **three dots (...)** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (2-5 minutes)

#### 4. Test Login

Visit your production URL and login with:
- **Email:** `admin@vanityhub.com`
- **Password:** `Admin33#`

Or use the manager account:
- **Email:** `Tsedey@habeshasalon.com`
- **Password:** `Admin33#`

Or any staff email with password: `Admin33#`

---

## 📊 Client Profile - Transaction Tracking

### ✅ Already Implemented and Working

Your client profiles **already track** appointments and purchases! Here's what's working:

#### 1. Total Spent Column
- Shows sum of all **completed transactions** for each client
- Calculated from the `Transaction` table in database
- Updates automatically when new transactions are created

#### 2. Client History
- Shows all appointments with services and amounts
- Shows all product purchases with items and amounts
- Timeline view of all client activities

#### 3. Transaction Details
- Service sales (from appointments)
- Product sales (from POS)
- Payment methods
- Discount amounts
- Item breakdowns

### How It Works

```
When a sale is made:
1. Transaction record created in database
2. Linked to client's userId
3. Status set to COMPLETED
4. Amount recorded

When viewing client profile:
1. API fetches all COMPLETED transactions
2. Sums up total amount
3. Displays in "Total Spent" column
4. Shows detailed history in client details
```

### Database Schema

```sql
-- Transactions table
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,           -- Links to client
  amount DECIMAL NOT NULL,         -- Total amount
  type TEXT NOT NULL,              -- SERVICE_SALE, PRODUCT_SALE, etc.
  status TEXT DEFAULT 'PENDING',   -- COMPLETED transactions count toward total
  method TEXT NOT NULL,            -- CASH, CARD, etc.
  appointmentId TEXT,              -- Optional link to appointment
  serviceAmount DECIMAL,           -- Service subtotal
  productAmount DECIMAL,           -- Product subtotal
  discountAmount DECIMAL,          -- Discount applied
  items TEXT,                      -- JSON array of items
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Verify It's Working

#### Check in UI:
1. Go to **Clients** page
2. Look at **Total Spent** column
3. Click on a client
4. View their **History** tab
5. You should see:
   - All appointments
   - All purchases
   - Total amounts

#### Check in Database:
```sql
-- See all transactions for a client
SELECT * FROM transactions 
WHERE "userId" = 'client-user-id' 
ORDER BY "createdAt" DESC;

-- See total spent per client
SELECT 
  u.email,
  c.name,
  SUM(t.amount) as total_spent
FROM transactions t
JOIN "User" u ON t."userId" = u.id
JOIN clients c ON c."userId" = u.id
WHERE t.status = 'COMPLETED'
GROUP BY u.email, c.name
ORDER BY total_spent DESC;
```

### Creating Transactions

Transactions are automatically created when:

**1. Appointment Checkout:**
- When appointment status changes to COMPLETED
- Transaction created with appointment services
- Linked to client's userId

**2. POS Sales:**
- When products/services are sold
- Transaction created with sale items
- Linked to client's userId

**3. Online Orders:**
- When client places order in client portal
- Transaction created with order items
- Linked to client's userId

### Example Transaction Creation

```typescript
// When completing an appointment
await prisma.transaction.create({
  data: {
    userId: appointment.clientId,
    amount: appointment.totalPrice,
    type: 'SERVICE_SALE',
    status: 'COMPLETED',
    method: 'CARD',
    appointmentId: appointment.id,
    serviceAmount: appointment.totalPrice,
    items: JSON.stringify([
      {
        type: 'service',
        name: 'Braiding',
        price: 150,
        quantity: 1
      }
    ])
  }
})
```

---

## 🚀 Production Deployment Checklist

### Before Deploying

- [x] Real staff data seeded (23 staff members)
- [x] Admin password set to `Admin33#`
- [x] All staff passwords set to `Admin33#`
- [x] Database schema up to date
- [x] Services seeded (144 services)
- [x] Locations configured (5 locations)
- [ ] **Environment variables set in Vercel** ⚠️ DO THIS NOW
- [ ] **NEXTAUTH_URL updated to actual Vercel URL** ⚠️ DO THIS NOW

### After Deploying

- [ ] Test admin login
- [ ] Test manager login (Tsedey)
- [ ] Test staff login
- [ ] Verify clients page loads
- [ ] Verify total spent shows correct amounts
- [ ] Create test appointment and verify transaction
- [ ] Create test sale and verify transaction
- [ ] Check client history shows all data

---

## 🐛 Troubleshooting

### "Login Failed" in Production

**Cause:** Environment variables not set in Vercel

**Fix:**
1. Set `NEXTAUTH_SECRET` in Vercel (must match local .env)
2. Set `NEXTAUTH_URL` to your actual Vercel URL
3. Set `DATABASE_URL` in Vercel
4. Redeploy

### "Total Spent" Shows $0

**Cause:** No completed transactions for client

**Fix:**
1. Check if transactions exist: `SELECT * FROM transactions WHERE "userId" = 'client-user-id'`
2. Check transaction status: Must be `COMPLETED`
3. Verify userId matches between client and transaction

### Client History Empty

**Cause:** Appointments/transactions not linked to client

**Fix:**
1. Verify appointments use client's `userId` (not client ID)
2. Check transactions are linked to correct `userId`
3. Verify API endpoint: `/api/clients/[id]/history`

---

## 📝 Summary

### Login Issue - ACTION REQUIRED

**Problem:** Can't login in production
**Solution:** Set environment variables in Vercel (see Step 2 above)
**Time:** 5 minutes
**Priority:** 🔴 CRITICAL

### Transaction Tracking - ALREADY WORKING

**Status:** ✅ Fully implemented
**Features:**
- Total spent calculation
- Appointment history
- Purchase history
- Transaction details

**No action needed** - just verify it's working after fixing login issue.

---

## 🎯 Next Steps

1. **NOW:** Set environment variables in Vercel
2. **NOW:** Redeploy from Vercel dashboard
3. **THEN:** Test login with `admin@vanityhub.com` / `Admin33#`
4. **THEN:** Verify client data displays correctly
5. **THEN:** Create test transaction and verify it appears

**Estimated Time:** 10 minutes total

