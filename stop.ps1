Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Zeshto Face Skin Analyzer" -ForegroundColor Red
Write-Host "   Stopping Application..." -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill Node.js processes running on ports 5000 and 5173
Write-Host "Stopping backend server (port 5000)..." -ForegroundColor Yellow
$backendProcesses = netstat -aon | Select-String ":5000" | ForEach-Object {
    $fields = $_.ToString().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
    if ($fields.Length -ge 5) {
        $fields[4]
    }
}
foreach ($processId in $backendProcesses) {
    try {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    } catch {
        # Ignore errors
    }
}

Write-Host "Stopping frontend server (port 5173)..." -ForegroundColor Yellow
$frontendProcesses = netstat -aon | Select-String ":5173" | ForEach-Object {
    $fields = $_.ToString().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
    if ($fields.Length -ge 5) {
        $fields[4]
    }
}
foreach ($processId in $frontendProcesses) {
    try {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    } catch {
        # Ignore errors
    }
}

Write-Host ""
Write-Host "Application stopped successfully" -ForegroundColor Green
Write-Host "All servers have been terminated." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"