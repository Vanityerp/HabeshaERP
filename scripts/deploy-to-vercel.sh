#!/bin/bash

# Deployment Script for HabeshaERP to Vercel
# This script helps deploy the application to Vercel with proper database setup

echo "🚀 HabeshaERP Vercel Deployment Script"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is installed"
echo ""

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo ""
echo "Before deploying, make sure you have:"
echo "  ✅ Set DATABASE_URL in Vercel environment variables"
echo "  ✅ Set NEXTAUTH_SECRET in Vercel environment variables"
echo "  ✅ Set NEXTAUTH_URL in Vercel environment variables"
echo ""
read -p "Have you set all environment variables in Vercel? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "⚠️  Please set environment variables first:"
    echo "   1. Go to https://vercel.com/vanityerps-projects"
    echo "   2. Select your project"
    echo "   3. Go to Settings → Environment Variables"
    echo "   4. Add the required variables (see VERCEL_DEPLOYMENT_CHECKLIST.md)"
    echo ""
    exit 1
fi

echo ""
echo "🔗 Linking to Vercel project..."
vercel link

echo ""
echo "📦 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Wait for deployment to complete"
echo "2. Run database migrations:"
echo "   vercel env pull .env.vercel"
echo "   npx prisma migrate deploy"
echo "3. Seed the database (if needed):"
echo "   npx prisma db seed"
echo "4. Test the deployment:"
echo "   https://habesha-erp.vercel.app/api/check-db"
echo "   https://habesha-erp.vercel.app/login"
echo ""
echo "🎉 Deployment complete!"

