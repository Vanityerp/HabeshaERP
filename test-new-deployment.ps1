$body = @{
    email = "admin@vanityhub.com"
    password = "Admin2024"
} | ConvertTo-Json

$url = "https://habesha-geuckmq8p-vanityerps-projects.vercel.app"

Write-Host "Testing production login..." -ForegroundColor Yellow
Write-Host "URL: $url/api/direct-login" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$url/api/direct-login" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "✅ AUTHENTICATION SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "✅ YOU CAN NOW LOG IN!" -ForegroundColor Green  
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "Login at: $url/login" -ForegroundColor Cyan
    Write-Host "Email: admin@vanityhub.com" -ForegroundColor Yellow
    Write-Host "Password: Admin2024" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
