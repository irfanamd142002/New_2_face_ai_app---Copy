Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Zeshto Face Skin Analyzer" -ForegroundColor Green
Write-Host "   Starting Application..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Step 1: Check Node.js installation
Write-Host "[1/6] Checking Node.js installation..." -ForegroundColor Yellow
if (Test-Command "node") {
    try {
        $nodeVersion = node --version
        Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Node.js command failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "[ERROR] Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 2: Check npm installation
Write-Host "[2/6] Checking npm installation..." -ForegroundColor Yellow
if (Test-Command "npm") {
    try {
        $npmVersion = npm --version
        Write-Host "[OK] npm version: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] npm command failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "[ERROR] npm is not installed" -ForegroundColor Red
    Write-Host "Please install npm (usually comes with Node.js)" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Check and install root dependencies
Write-Host "[3/6] Checking root dependencies..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "[INSTALL] Installing root dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install root dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[OK] Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[OK] Root dependencies already installed" -ForegroundColor Green
}

# Step 4: Check and install server dependencies
Write-Host "[4/6] Checking server dependencies..." -ForegroundColor Yellow
if (!(Test-Path "server\node_modules")) {
    Write-Host "[INSTALL] Installing server dependencies..." -ForegroundColor Cyan
    Push-Location "server"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install server dependencies" -ForegroundColor Red
        Pop-Location
        Read-Host "Press Enter to exit"
        exit 1
    }
    Pop-Location
    Write-Host "[OK] Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[OK] Server dependencies already installed" -ForegroundColor Green
}

# Step 5: Check and install client dependencies
Write-Host "[5/6] Checking client dependencies..." -ForegroundColor Yellow
if (!(Test-Path "client\node_modules")) {
    Write-Host "[INSTALL] Installing client dependencies..." -ForegroundColor Cyan
    Push-Location "client"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install client dependencies" -ForegroundColor Red
        Pop-Location
        Read-Host "Press Enter to exit"
        exit 1
    }
    Pop-Location
    Write-Host "[OK] Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[OK] Client dependencies already installed" -ForegroundColor Green
}

# Step 6: Check MongoDB status (optional)
Write-Host "[6/6] Checking MongoDB status..." -ForegroundColor Yellow
$mongoRunning = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "[OK] MongoDB is running on port 27017" -ForegroundColor Green
} else {
    Write-Host "[INFO] MongoDB not detected - will use in-memory database" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[START] Starting Zeshto Face Skin Analyzer..." -ForegroundColor Green
Write-Host ""
Write-Host "[WEB] Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "[API] Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] The application will start in development mode" -ForegroundColor Yellow
Write-Host "[STOP] Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the application
try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to start the application" -ForegroundColor Red
    Write-Host ""
    Write-Host "[HELP] Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Make sure all dependencies are installed" -ForegroundColor White
    Write-Host "2. Check if ports 5000 and 5173 are available" -ForegroundColor White
    Write-Host "3. Verify your internet connection" -ForegroundColor White
    Write-Host "4. Try running: npm run install-all" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}