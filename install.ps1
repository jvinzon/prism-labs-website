# PRISM Labs Website - Automated Installation Script
# Run this in PowerShell: .\install.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRISM Labs Website - Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "[1/6] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Download the LTS version (v20.x recommended)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after installing Node.js"
    
    # Check again
    try {
        $nodeVersion = node --version
        Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Still not found. Please restart PowerShell and try again." -ForegroundColor Red
        exit 1
    }
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "  ✓ npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Navigate to directory
Write-Host "[2/6] Checking project directory..." -ForegroundColor Yellow
$projectDir = "C:\Users\jedidiah\prism-labs-website"

if (Test-Path $projectDir) {
    Set-Location $projectDir
    Write-Host "  ✓ In project directory: $projectDir" -ForegroundColor Green
} else {
    Write-Host "  ✗ Project directory not found!" -ForegroundColor Red
    Write-Host "  Expected at: $projectDir" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 3: Check package.json
Write-Host "[3/6] Checking package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "  ✓ package.json found" -ForegroundColor Green
} else {
    Write-Host "  ✗ package.json not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Install dependencies
Write-Host "[4/6] Installing npm dependencies..." -ForegroundColor Yellow
Write-Host "  This may take 2-5 minutes..." -ForegroundColor Gray

try {
    npm install --loglevel=error
    Write-Host "  ✓ Dependencies installed successfully" -ForegroundColor Green
    
    # Check node_modules
    if (Test-Path "node_modules") {
        $moduleCount = (Get-ChildItem "node_modules" -Directory).Count
        Write-Host "  ✓ Installed $moduleCount packages" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Installation failed!" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running: npm install --verbose" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 5: Create .env file
Write-Host "[5/6] Setting up environment configuration..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "  ✓ .env file already exists" -ForegroundColor Green
    Write-Host "  ⚠ Make sure to configure API keys in .env" -ForegroundColor Yellow
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ Created .env from .env.example" -ForegroundColor Green
    Write-Host "  ⚠ IMPORTANT: Edit .env and add required API keys" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Initialize database
Write-Host "[6/6] Initializing database..." -ForegroundColor Yellow

try {
    npm run init-db
    Write-Host "  ✓ Database initialized successfully" -ForegroundColor Green
    
    # Check database file
    if (Test-Path "data\prism-labs.db") {
        $dbSize = (Get-Item "data\prism-labs.db").Length / 1KB
        Write-Host "  ✓ Database created: data\prism-labs.db ($([math]::Round($dbSize, 2)) KB)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Database initialization failed!" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Complete! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env and add your API keys (especially for Microsoft OAuth)" -ForegroundColor White
Write-Host "  2. Create admin user in database (see INSTALL_GUIDE.md)" -ForegroundColor White
Write-Host "  3. Start the server: npm run dev" -ForegroundColor White
Write-Host "  4. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Creating admin user now..." -ForegroundColor Yellow
Write-Host ""

# Create admin user script
$adminScript = @"
const db = require('./db');

try {
  db.prepare(`
    INSERT OR IGNORE INTO users (id, email, name, role, year_level)
    VALUES ('admin-001', 'jedidiah@asdah.school.nz', 'Jedidiah Vinzon', 'admin', NULL)
  `).run();
  
  console.log('✓ Admin user created successfully!');
  console.log('  Email: jedidiah@asdah.school.nz');
  console.log('  Role: admin');
} catch (err) {
  console.error('Error:', err.message);
}

db.close();
"@

Set-Content "scripts\create-admin.js" $adminScript

try {
    node scripts\create-admin.js
} catch {
    Write-Host "  ⚠ Could not create admin user automatically" -ForegroundColor Yellow
    Write-Host "  See INSTALL_GUIDE.md for manual instructions" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "To start the server, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
