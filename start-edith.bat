@echo off
title EDITH - Enhanced Digital Intelligence & Task Handler
echo ========================================================
echo       PROJECT EDITH - The AI Senior For College
echo ========================================================
echo.

cd /d "%~dp0"

set "NODE_DIR=%LOCALAPPDATA%\nodejs-extract\node-v20.17.0-win-x64"
set "PATH=%NODE_DIR%;%PATH%"

set "NODE_BIN=%NODE_DIR%\node.exe"
set "NPM_CLI=%NODE_DIR%\node_modules\npm\bin\npm-cli.js"

if not exist "%NODE_BIN%" (
    echo [!] Node.exe not found in portable path, checking system path...
    set "NODE_BIN=node"
)

if exist "%NPM_CLI%" (
    set NPM_CMD="%NODE_BIN%" "%NPM_CLI%"
) else (
    set NPM_CMD=npm
)

echo [✓] Node runtime ready.
echo.

if not exist "node_modules\" (
    echo [*] Installing dependencies for Project EDITH...
    echo [*] This will take around 30-60 seconds on first run. Please wait...
    call %NPM_CMD% install --no-audit --no-fund
    if %ERRORLEVEL% neq 0 (
        echo [!] npm install encountered an issue. Retrying with legacy-peer-deps...
        call %NPM_CMD% install --legacy-peer-deps
    )
)

echo.
echo [*] Launching EDITH at http://localhost:3000...
start http://localhost:3000
call %NPM_CMD% run dev
pause
