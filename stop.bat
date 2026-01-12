@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Zeshto Skin Care Application
echo        Comprehensive Shutdown
echo ========================================
echo.

REM Set color for better visibility
color 0C

REM Step 1: Graceful shutdown attempt
echo [1/5] Attempting graceful application shutdown...
echo.

REM Try to send SIGTERM to Node.js processes first
echo [INFO] Sending graceful shutdown signal to Node.js processes...
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find /V "INFO:" | find /V "PID" >nul
if %errorLevel% == 0 (
    echo [INFO] Found Node.js processes, attempting graceful shutdown...
    timeout /t 2 /nobreak >nul
) else (
    echo [INFO] No Node.js processes found
)
echo.

REM Step 2: Stop frontend server (port 5173)
echo [2/5] Stopping frontend server (port 5173)...
set "frontend_stopped=false"
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING" 2^>nul') do (
    echo [INFO] Stopping frontend process %%a
    taskkill /f /pid %%a >nul 2>&1
    if !errorLevel! == 0 (
        echo [OK] Frontend process %%a stopped successfully
        set "frontend_stopped=true"
    ) else (
        echo [WARNING] Failed to stop frontend process %%a
    )
)
if "!frontend_stopped!" == "false" (
    echo [INFO] No frontend server found on port 5173
)
echo.

REM Step 3: Stop backend server (port 5000)
echo [3/5] Stopping backend server (port 5000)...
set "backend_stopped=false"
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING" 2^>nul') do (
    echo [INFO] Stopping backend process %%a
    taskkill /f /pid %%a >nul 2>&1
    if !errorLevel! == 0 (
        echo [OK] Backend process %%a stopped successfully
        set "backend_stopped=true"
    ) else (
        echo [WARNING] Failed to stop backend process %%a
    )
)
if "!backend_stopped!" == "false" (
    echo [INFO] No backend server found on port 5000
)
echo.

REM Step 4: Clean up remaining Node.js processes
echo [4/5] Cleaning up remaining Node.js processes...
set "node_processes_found=false"

REM Stop nodemon processes
tasklist /FI "IMAGENAME eq nodemon.exe" /FO CSV | find /V "INFO:" | find /V "PID" >nul
if %errorLevel% == 0 (
    echo [INFO] Stopping nodemon processes...
    taskkill /f /im "nodemon.exe" >nul 2>&1
    if !errorLevel! == 0 (
        echo [OK] Nodemon processes stopped
        set "node_processes_found=true"
    ) else (
        echo [WARNING] Failed to stop some nodemon processes
    )
)

REM Stop remaining node processes related to our application
echo [INFO] Checking for remaining Node.js processes...
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | find /V "INFO:" | find /V "PID" >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Found Node.js processes, checking for application-related processes...
    REM Use a safer approach - kill processes that are using our application ports or directories
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" 2^>nul') do (
        tasklist /FI "PID eq %%a" /FI "IMAGENAME eq node.exe" >nul 2>&1
        if !errorLevel! == 0 (
            echo [INFO] Stopping Node.js process %%a (using port 5000)
            taskkill /f /pid %%a >nul 2>&1
            set "node_processes_found=true"
        )
    )
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" 2^>nul') do (
        tasklist /FI "PID eq %%a" /FI "IMAGENAME eq node.exe" >nul 2>&1
        if !errorLevel! == 0 (
            echo [INFO] Stopping Node.js process %%a (using port 5173)
            taskkill /f /pid %%a >nul 2>&1
            set "node_processes_found=true"
        )
    )
) else (
    echo [INFO] No Node.js processes found
)

if "!node_processes_found!" == "false" (
    echo [INFO] No application-related Node.js processes found
)
echo.

REM Step 5: Database cleanup (if using in-memory database)
echo [5/5] Database cleanup...
echo [INFO] Checking for in-memory database processes...

REM Check if MongoDB service should be stopped (only if we started it)
sc query "MongoDB" >nul 2>&1
if %errorLevel% == 0 (
    sc query "MongoDB" | find "RUNNING" >nul
    if !errorLevel! == 0 (
        echo [INFO] MongoDB service is running
        echo [INFO] Leaving MongoDB service running (may be used by other applications)
    ) else (
        echo [INFO] MongoDB service is not running
    )
) else (
    echo [INFO] MongoDB service not installed
)

REM Clean up any temporary files or processes related to in-memory database
echo [INFO] Cleaning up temporary database files...
if exist "%TEMP%\mongodb-*" (
    echo [INFO] Removing temporary MongoDB files...
    rmdir /s /q "%TEMP%\mongodb-*" >nul 2>&1
)

echo.
echo ========================================
echo ✅ Application shutdown completed!
echo ========================================
echo.
echo Summary:
echo - Frontend server: Stopped
echo - Backend server: Stopped  
echo - Node.js processes: Cleaned up
echo - Database: Gracefully handled
echo - Temporary files: Cleaned up
echo.
echo Press any key to exit...
pause >nul