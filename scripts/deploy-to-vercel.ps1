# PowerShell Deployment Script for HabeshaERP to Vercel
# This script helps deploy the application to Vercel with proper database setup

Write-Host "🚀 HabeshaERP Vercel Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI is not installed" -ForegroundColor Red
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
Write-Host ""

# Login to Vercel
Write-Host "🔐 Logging in to Vercel..." -ForegroundColor Cyan
vercel login

Write-Host ""
Write-Host "📋 Deployment Checklist:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Before deploying, make sure you have:" -ForegroundColor Yellow
Write-Host "  ✅ Set DATABASE_URL in Vercel environment variables"
Write-Host "  ✅ Set NEXTAUTH_SECRET in Vercel environment variables"
Write-Host "  ✅ Set NEXTAUTH_URL in Vercel environment variables"
Write-Host ""

$response = Read-Host "Have you set all environment variables in Vercel? (y/n)"

if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host ""
    Write-Host "⚠️  Please set environment variables first:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://vercel.com/vanityerps-projects"
    Write-Host "   2. Select your project"
    Write-Host "   3. Go to Settings → Environment Variables"
    Write-Host "   4. Add the required variables (see VERCEL_DEPLOYMENT_CHECKLIST.md)"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "🔗 Linking to Vercel project..." -ForegroundColor Cyan
vercel link

Write-Host ""
Write-Host "📦 Deploying to production..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "1. Wait for deployment to complete"
Write-Host "2. Run database migrations:"
Write-Host "   vercel env pull .env.vercel"
Write-Host "   npx prisma migrate deploy"
Write-Host "3. Seed the database (if needed):"
Write-Host "   npx prisma db seed"
Write-Host "4. Test the deployment:"
Write-Host "   https://habesha-erp.vercel.app/api/check-db"
Write-Host "   https://habesha-erp.vercel.app/login"
Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green

