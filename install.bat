@echo off
echo ========================================
echo PRISM Labs Website - Installation Script
echo ========================================
echo.

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found: 
node --version
echo.

echo Step 2: Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo.

echo Step 3: Creating .env file from template...
if not exist .env (
    copy .env.example .env
    echo .env file created - Please edit with your API keys!
) else (
    echo .env file already exists
)
echo.

echo Step 4: Initializing database...
call npm run init-db
if %errorlevel% neq 0 (
    echo ERROR: Database initialization failed
    pause
    exit /b 1
)
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env and add your API keys
echo 2. Create first admin user in database
echo 3. Run 'npm run dev' to start the server
echo 4. Visit http://localhost:3000
echo.
pause
