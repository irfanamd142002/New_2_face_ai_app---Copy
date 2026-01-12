@echo off
echo Testing batch file execution...

echo Step 1: Node.js check
node --version
echo Node.js check completed

echo Step 2: npm check  
npm --version
echo npm check completed

echo Step 3: Dependencies check
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
) else (
    echo Root dependencies exist
)

echo Step 4: Starting application
npm run dev

pause