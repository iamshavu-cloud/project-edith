# Project EDITH - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      PROJECT EDITH - The AI Senior For College" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$portableNode = "$env:LOCALAPPDATA\nodejs-extract\node-v20.17.0-win-x64"
if (Test-Path $portableNode) {
    $env:PATH = "$portableNode;$env:PATH"
    Write-Host "[✓] Configured Node.js portable environment" -ForegroundColor Green
}

if (-not (Test-Path "node_modules")) {
    Write-Host "[*] Installing dependencies (first-time setup)..." -ForegroundColor Yellow
    npm install
}

Write-Host "[*] Launching EDITH at http://localhost:3000..." -ForegroundColor Cyan
npm run dev
