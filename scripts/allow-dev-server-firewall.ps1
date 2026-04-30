# Run this script as Administrator to allow the Node dev server to accept connections.
# Right-click PowerShell -> Run as administrator, then:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   cd "C:\career-scrum-bot"
#   .\scripts\allow-dev-server-firewall.ps1
#
# Uses -Profile Any so it works on Private, Public, and Domain networks.

$ErrorActionPreference = "Stop"
$added = 0

# 1. Allow inbound TCP on port 3000 (all profiles) - most reliable
$name = "Node Dev Port 3000"
if (-not (Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName $name -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Any
  Write-Host "Added: $name (Profile Any)" -ForegroundColor Green
  $added++
} else { Write-Host "Exists: $name" -ForegroundColor Gray }

# 2. Allow inbound TCP on port 3001 (alternative port)
$name2 = "Node Dev Port 3001"
if (-not (Get-NetFirewallRule -DisplayName $name2 -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName $name2 -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -Profile Any
  Write-Host "Added: $name2 (Profile Any)" -ForegroundColor Green
  $added++
} else { Write-Host "Exists: $name2" -ForegroundColor Gray }

# 3. Allow Node.exe for all profiles (in case port rules aren't enough)
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Path
if ($nodePath) {
  $name3 = "Node.js Dev Server"
  if (-not (Get-NetFirewallRule -DisplayName $name3 -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName $name3 -Direction Inbound -Program $nodePath -Action Allow -Profile Any
    Write-Host "Added: $name3 for $nodePath" -ForegroundColor Green
    $added++
  } else { Write-Host "Exists: $name3" -ForegroundColor Gray }
}

if ($added -eq 0) { Write-Host "All rules already present." -ForegroundColor Green }
Write-Host "Try: http://127.0.0.1:3000 or npm run dev:3001 then http://127.0.0.1:3001" -ForegroundColor Cyan
