# 🚀 Production Login Setup Guide

## ✅ Build Successful!

Your application has been successfully deployed to Vercel. Now you need to configure the environment variables to enable login functionality.

---

## 🔧 Step 1: Set Environment Variables in Vercel

### Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Select your project: **HabeshaERP** (or whatever name you gave it)
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Add These 6 Required Variables

**IMPORTANT:** Copy and paste these EXACTLY as shown below:

#### 1. NEXTAUTH_SECRET
```
a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9
```
- **Name:** `NEXTAUTH_SECRET`
- **Value:** `a57b39e1af704dc01865a3962d734836136f039df6e1ff052fc7397fe74095f9`
- **Environment:** Select **Production**, **Preview**, and **Development**

#### 2. NEXTAUTH_URL
```
https://habesha-erp.vercel.app
```
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://habesha-erp.vercel.app` (or your actual Vercel URL)
- **Environment:** Select **Production** only

#### 3. DATABASE_URL
```
postgres://postgres.dzdgtmebfgdvglgldlph:jFq87cdhsdJnkigC@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```
- **Name:** `DATABASE_URL`
- **Value:** `postgres://postgres.dzdgtmebfgdvglgldlph:jFq87cdhsdJnkigC@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`
- **Environment:** Select **Production**, **Preview**, and **Development**

#### 4. USE_MOCK_DATA
```
false
```
- **Name:** `USE_MOCK_DATA`
- **Value:** `false`
- **Environment:** Select **Production**, **Preview**, and **Development**

#### 5. SKIP_DB_CONNECTION
```
false
```
- **Name:** `SKIP_DB_CONNECTION`
- **Value:** `false`
- **Environment:** Select **Production**, **Preview**, and **Development**

#### 6. NODE_ENV
```
production
```
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Select **Production** only

---

## 🔄 Step 2: Redeploy Your Application

After adding all environment variables:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the three dots (...) menu
4. Select **Redeploy**
5. **IMPORTANT:** Make sure "Use existing Build Cache" is **CHECKED** this time (since the build already succeeded)
6. Click **Redeploy**

Wait 2-3 minutes for the deployment to complete.

---

## 🔐 Step 3: Login Credentials

Once the deployment is complete, go to your production URL and login with:

### Admin Account
- **Email:** `admin@vanityhub.com`
- **Password:** `Admin33#`

**IMPORTANT:** 
- The password is **case-sensitive**
- Make sure to type `Admin33#` exactly (capital A, number 3 twice, hash symbol)

---

## 🐛 Troubleshooting

### If Login Still Fails:

#### 1. Check Browser Console
- Open browser DevTools (F12)
- Go to Console tab
- Look for any error messages
- Take a screenshot and share it

#### 2. Check Network Tab
- Open browser DevTools (F12)
- Go to Network tab
- Try to login
- Look for the `/api/auth/callback/credentials` request
- Check the response
- Take a screenshot and share it

#### 3. Verify Environment Variables
- Go to Vercel Dashboard → Settings → Environment Variables
- Make sure all 6 variables are set correctly
- Check for any typos or extra spaces

#### 4. Check Vercel Logs
- Go to Vercel Dashboard → Deployments
- Click on the latest deployment
- Click on **Runtime Logs**
- Look for any error messages when you try to login

#### 5. Verify Database Connection
- Visit: `https://your-app.vercel.app/api/status`
- This should show if the database is connected
- If it shows an error, the DATABASE_URL might be incorrect

---

## 📊 What Should Happen

### Successful Login Flow:
1. Enter email: `admin@vanityhub.com`
2. Enter password: `Admin33#`
3. Click "Sign in"
4. You should see a success toast message
5. You should be redirected to `/dashboard`
6. Dashboard should load with all your data

### If Login Fails:
- You'll see an error message: "Invalid email or password"
- Check the troubleshooting steps above

---

## 🎯 Quick Checklist

- [ ] All 6 environment variables are set in Vercel
- [ ] Application has been redeployed after setting variables
- [ ] Using correct email: `admin@vanityhub.com`
- [ ] Using correct password: `Admin33#` (case-sensitive)
- [ ] Browser console shows no errors
- [ ] Database connection is working (check `/api/status`)

---

## 💡 Common Issues

### Issue: "Configuration Error"
**Solution:** NEXTAUTH_SECRET or NEXTAUTH_URL is not set correctly

### Issue: "Invalid email or password"
**Solution:** 
- Check if DATABASE_URL is correct
- Verify the password is exactly `Admin33#`
- Check if the admin user exists in the database

### Issue: Login button does nothing
**Solution:** 
- Check browser console for JavaScript errors
- Make sure NEXTAUTH_URL matches your actual Vercel URL

### Issue: Redirects to login page after successful login
**Solution:** 
- NEXTAUTH_SECRET might be missing
- Clear browser cookies and try again

---

## 📞 Need Help?

If you're still having issues after following all these steps:

1. Take screenshots of:
   - Browser console errors
   - Network tab showing the login request/response
   - Vercel environment variables page (hide sensitive values)
   - Vercel runtime logs

2. Share these screenshots so I can help diagnose the issue

---

## ✅ Success!

Once you successfully login, you should see:
- ✅ Dashboard with all your salon data
- ✅ Client management features
- ✅ Appointment booking
- ✅ Staff management
- ✅ Reports and analytics
- ✅ All features from development environment

**Your production deployment is complete!** 🎉

