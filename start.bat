@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Zeshto Skin Care Application
echo         Comprehensive Startup
echo ========================================
echo.

REM Set color for better visibility
color 0A

REM Check if running as administrator (optional for MongoDB service management)
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running with administrator privileges
) else (
    echo [INFO] Running with standard user privileges
)
echo.

REM Step 1: Check and start MongoDB service if available
echo [1/4] Checking MongoDB service status...
sc query "MongoDB" >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] MongoDB service found. Checking status...
    sc query "MongoDB" | find "RUNNING" >nul
    if !errorLevel! == 0 (
        echo [OK] MongoDB service is already running
    ) else (
        echo [INFO] Starting MongoDB service...
        net start MongoDB >nul 2>&1
        if !errorLevel! == 0 (
            echo [OK] MongoDB service started successfully
        ) else (
            echo [WARNING] Could not start MongoDB service - will use in-memory database
        )
    )
) else (
    echo [INFO] MongoDB service not installed - will use in-memory database
)
echo.

REM Step 2: Check for MongoDB process if service not available
echo [2/4] Checking for MongoDB process...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe" >NUL
if %errorLevel% == 0 (
    echo [OK] MongoDB process is running
) else (
    echo [INFO] MongoDB process not found - application will use in-memory database
)
echo.

REM Step 3: Execute the PowerShell startup script
echo [3/4] Starting application components...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Failed to start the application. Please check the error messages above.
    echo.
    echo Troubleshooting steps:
    echo 1. Ensure Node.js is installed (v16 or higher)
    echo 2. Check if ports 5000 and 5173 are available
    echo 3. Verify internet connection for dependency installation
    echo 4. Check antivirus software is not blocking the application
    echo.
    pause
    exit /b 1
)

REM Step 4: Final verification
echo.
echo [4/4] Verifying application startup...
timeout /t 3 /nobreak >nul

REM Check if backend is running
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Backend server is responding on port 5000
) else (
    echo [WARNING] Backend server health check failed - may still be starting
)

REM Check if frontend is accessible
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Frontend server is responding on port 5173
) else (
    echo [WARNING] Frontend server health check failed - may still be starting
)

echo.
echo ========================================
echo ✅ Application startup completed!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo 📊 Database: MongoDB (local) or In-Memory fallback
echo.
echo Press any key to continue...
pause >nul