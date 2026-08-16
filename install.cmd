@echo off
color 0B
echo ========================================
echo PRISM Labs Website - Installation
echo ========================================
echo.

REM Step 1: Check Node.js
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   X Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version (v20.x recommended)
    echo.
    pause
    echo.
    echo Checking again...
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo   X Still not found. Please restart CMD and try again.
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%a in ('node --version') do set NODE_VER=%%a
echo   OK Node.js installed: %NODE_VER%

for /f "tokens=*" %%a in ('npm --version') do set NPM_VER=%%a
echo   OK npm installed: v%NPM_VER%
echo.

REM Step 2: Check directory
echo [2/6] Checking project directory...
if not exist "package.json" (
    echo   X package.json not found!
    echo   Make sure you're in the prism-labs-website folder
    pause
    exit /b 1
)
echo   OK In project directory
echo.

REM Step 3: Install dependencies
echo [3/6] Installing npm dependencies...
echo   This may take 2-5 minutes...
call npm install --loglevel=error
if %errorlevel% neq 0 (
    echo   X Installation failed!
    pause
    exit /b 1
)
echo   OK Dependencies installed
echo.

REM Step 4: Create .env
echo [4/6] Setting up environment...
if exist ".env" (
    echo   OK .env already exists
) else (
    copy .env.example .env
    echo   OK Created .env from template
)
echo   IMPORTANT: Edit .env and add API keys
echo.

REM Step 5: Initialize database
echo [5/6] Initializing database...
call npm run init-db
if %errorlevel% neq 0 (
    echo   X Database initialization failed!
    pause
    exit /b 1
)
echo   OK Database initialized
echo.

REM Step 6: Create admin user
echo [6/6] Creating admin user...
echo const db = require('./db'); > scripts\create-admin.js
echo try { >> scripts\create-admin.js
echo   db.prepare(`INSERT OR IGNORE INTO users (id, email, name, role) VALUES ('admin-001', 'jedidiah@asdah.school.nz', 'Jedidiah Vinzon', 'admin')`).run(); >> scripts\create-admin.js
echo   console.log('OK Admin user created!'); >> scripts\create-admin.js
echo } catch (err) { console.error('Error:', err.message); } >> scripts\create-admin.js
echo db.close(); >> scripts\create-admin.js

node scripts\create-admin.js
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next Steps:
echo   1. Edit .env and add API keys
echo   2. Start server: npm run dev
echo   3. Open browser: http://localhost:3000
echo.
echo See INSTALL_GUIDE.md for detailed help
echo.
pause
