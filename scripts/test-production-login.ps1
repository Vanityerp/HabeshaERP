# Admin Login Testing and Fix Script for Production
# This script tests and fixes admin login issues on Vercel

$BASE_URL = "https://habesha-erp.vercel.app"
$ADMIN_EMAIL = "admin@vanityhub.com"
$ADMIN_PASSWORD = "Admin33#"

Write-Host "🔍 Testing Admin Login on Production" -ForegroundColor Cyan
Write-Host "URL: $BASE_URL" -ForegroundColor Gray
Write-Host ""

# Function to make API calls
function Invoke-ApiTest {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [object]$Body = $null,
        [string]$Description
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "Endpoint: $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ Success" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5
        Write-Host ""
        return $response
    }
    catch {
        Write-Host "❌ Failed" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
        Write-Host ""
        return $null
    }
}

# Step 1: Check if database is accessible
Write-Host "=== Step 1: Database Check ===" -ForegroundColor Cyan
Invoke-ApiTest -Endpoint "/api/check-db" -Description "Database connectivity"

# Step 2: Check admin user status
Write-Host "=== Step 2: Admin User Status ===" -ForegroundColor Cyan
$adminStatus = Invoke-ApiTest -Endpoint "/api/test-admin-login" -Description "Current admin status"

# Step 3: If admin doesn't exist or test fails, ensure admin exists
if (!$adminStatus -or !$adminStatus.exists) {
    Write-Host "=== Step 3: Creating/Updating Admin User ===" -ForegroundColor Cyan
    $ensureBody = @{
        email = $ADMIN_EMAIL
        password = $ADMIN_PASSWORD
    }
    Invoke-ApiTest -Endpoint "/api/ensure-admin" -Method "POST" -Body $ensureBody -Description "Ensure admin user exists"
}

# Step 4: Test admin login flow
Write-Host "=== Step 4: Testing Login Flow ===" -ForegroundColor Cyan
$loginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
}
$loginTest = Invoke-ApiTest -Endpoint "/api/test-admin-login" -Method "POST" -Body $loginBody -Description "Login flow test"

# Step 5: Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
if ($loginTest -and $loginTest.success) {
    Write-Host "✅ Admin login is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Login Credentials:" -ForegroundColor Cyan
    Write-Host "  Email: $ADMIN_EMAIL" -ForegroundColor White
    Write-Host "  Password: $ADMIN_PASSWORD" -ForegroundColor White
    Write-Host ""
    Write-Host "Login URL: $BASE_URL/login" -ForegroundColor Cyan
} else {
    Write-Host "❌ Admin login is not working" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check Vercel environment variables" -ForegroundColor White
    Write-Host "2. Check Vercel deployment logs" -ForegroundColor White
    Write-Host "3. Verify DATABASE_URL is correct" -ForegroundColor White
    Write-Host "4. Run: vercel env ls" -ForegroundColor White
}
