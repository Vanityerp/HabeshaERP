$baseUrl = "https://habesha-erp.vercel.app"

Write-Host "`n🧪 Testing Production APIs...`n" -ForegroundColor Cyan

$endpoints = @(
    @{ Name = "Locations"; Url = "$baseUrl/api/locations" },
    @{ Name = "Services"; Url = "$baseUrl/api/services" },
    @{ Name = "Staff"; Url = "$baseUrl/api/staff" },
    @{ Name = "Clients"; Url = "$baseUrl/api/clients" },
    @{ Name = "Products"; Url = "$baseUrl/api/products" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "Testing $($endpoint.Name)..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint.Url -Method GET -ErrorAction Stop
        
        if ($response -is [Array]) {
            $count = $response.Count
        } elseif ($response.data -is [Array]) {
            $count = $response.data.Count
        } elseif ($response.locations -is [Array]) {
            $count = $response.locations.Count
        } elseif ($response.services -is [Array]) {
            $count = $response.services.Count
        } elseif ($response.staff -is [Array]) {
            $count = $response.staff.Count
        } elseif ($response.clients -is [Array]) {
            $count = $response.clients.Count
        } elseif ($response.products -is [Array]) {
            $count = $response.products.Count
        } else {
            $count = "Unknown format"
        }
        
        Write-Host "  ✅ SUCCESS - $count items" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
            Write-Host "  Response: $body" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

Write-Host "=========================" -ForegroundColor Cyan
