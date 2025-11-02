$body = @{
    email = "admin@vanityhub.com"
    password = "Admin2024"
} | ConvertTo-Json

$url = "https://habesha-erp.vercel.app"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  FINAL PRODUCTION LOGIN TEST" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing: $url/api/direct-login" -ForegroundColor Yellow
Write-Host "Email: admin@vanityhub.com" -ForegroundColor Yellow
Write-Host "Password: Admin2024" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$url/api/direct-login" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "  ✅ SUCCESS! AUTHENTICATION WORKS!" -ForegroundColor Green  
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "User Details:" -ForegroundColor Cyan
    Write-Host "  ID: $($response.user.id)" -ForegroundColor White
    Write-Host "  Email: $($response.user.email)" -ForegroundColor White
    Write-Host "  Role: $($response.user.role)" -ForegroundColor White
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "  🎉 YOU CAN NOW LOG IN!" -ForegroundColor Magenta  
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "🌐 Login URL: $url/login" -ForegroundColor Cyan
    Write-Host "📧 Email: admin@vanityhub.com" -ForegroundColor Yellow
    Write-Host "🔑 Password: Admin2024" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host "  ❌ AUTHENTICATION FAILED" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host ""
            Write-Host "Response:" -ForegroundColor Yellow
            Write-Host $responseBody -ForegroundColor Gray
        } catch {
            Write-Host "Could not read error response" -ForegroundColor Gray
        }
    }
    Write-Host ""
}
