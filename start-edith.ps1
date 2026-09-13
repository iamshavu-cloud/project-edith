# Project EDITH - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      PROJECT EDITH - The AI Senior For College" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

$nodeDir = "$env:LOCALAPPDATA\nodejs-extract\node-v20.17.0-win-x64"
$nodeBin = "$nodeDir\node.exe"
$npmCli = "$nodeDir\node_modules\npm\bin\npm-cli.js"

if (Test-Path $nodeDir) {
    $env:PATH = "$nodeDir;$env:PATH"
    Write-Host "[✓] Configured portable Node.js environment" -ForegroundColor Green
}

if (-not (Test-Path "node_modules")) {
    Write-Host "[*] Installing dependencies for Project EDITH (first run)..." -ForegroundColor Yellow
    if (Test-Path $npmCli) {
        & "$nodeBin" "$npmCli" install --no-audit --no-fund
    } else {
        npm install --no-audit --no-fund
    }
}

Write-Host "[*] Launching EDITH server at http://localhost:3000..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

if (Test-Path $npmCli) {
    & "$nodeBin" "$npmCli" run dev
} else {
    npm run dev
}
