@echo off
title EDITH - Enhanced Digital Intelligence & Task Handler
echo ========================================================
echo       PROJECT EDITH - The AI Senior For College
echo ========================================================
echo.

set "NODE_PATH=%LOCALAPPDATA%\nodejs-extract\node-v20.17.0-win-x64"
set "PATH=%NODE_PATH%;%PATH%"

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] Using portable Node environment...
    set "NPM_CMD=%NODE_PATH%\npm.cmd"
) else (
    set "NPM_CMD=npm"
)

if not exist "node_modules\" (
    echo [*] Installing Project EDITH dependencies...
    call "%NPM_CMD%" install
)

echo [*] Starting EDITH local server at http://localhost:3000...
call "%NPM_CMD%" run dev
pause
