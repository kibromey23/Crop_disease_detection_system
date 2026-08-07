@echo off
echo ===================================
echo  CropGuard AI - Local Setup
echo ===================================
echo.
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org (LTS version)
    pause
    exit /b 1
)
echo Node.js found.
echo.
echo Installing dependencies (this may take a minute)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)
echo.
echo Starting CropGuard AI development server...
echo The app will open at http://localhost:5173
echo Press Ctrl+C to stop the server.
echo.
call npm run dev
pause
