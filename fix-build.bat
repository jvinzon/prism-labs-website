@echo off
echo ========================================
echo Fixing better-sqlite3 Build Issue
echo ========================================
echo.

echo Step 1: Installing Windows Build Tools...
echo This may take 5-10 minutes. Please wait...
echo.
call npm install --global windows-build-tools
echo.

echo Step 2: Rebuilding better-sqlite3...
call npm rebuild better-sqlite3
echo.

echo Step 3: Testing database initialization...
call node scripts\init-db.js
if %errorlevel% neq 0 (
    echo.
    echo Build failed. Trying alternative approach...
    echo.
    echo Step 4: Removing and reinstalling better-sqlite3...
    call npm uninstall better-sqlite3
    call npm install better-sqlite3@9.4.3
    echo.
    echo Step 5: Testing again...
    call node scripts\init-db.js
)

echo.
echo ========================================
echo Done!
echo ========================================
pause
