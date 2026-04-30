# Quick test that the dev server is reachable. Run from project root:
#   .\scripts\test-dev-server.ps1

$url = "http://127.0.0.1:3000/api/health"
Write-Host "Testing $url ..." -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
  Write-Host "OK: Server responded with status $($r.StatusCode)" -ForegroundColor Green
  Write-Host $r.Content
  exit 0
} catch {
  Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "If the server is running, run the firewall script as Administrator:" -ForegroundColor Yellow
  Write-Host "  Right-click PowerShell -> Run as administrator"
  Write-Host "  cd `"$PSScriptRoot\..`""
  Write-Host "  .\scripts\allow-dev-server-firewall.ps1"
  exit 1
}
