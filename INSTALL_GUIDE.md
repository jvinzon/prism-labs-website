# PRISM Labs Website - Installation Guide

## STEP 1: Install Node.js

### Option A: Download from Official Website (Recommended)

1. **Go to**: https://nodejs.org/
2. **Click**: The green "LTS" button (Long Term Support - recommended version)
3. **Download**: Node.js installer (will be something like `node-v20.x.x-x64.msi`)
4. **Run the installer**:
   - Double-click the downloaded `.msi` file
   - Click "Next" through the wizard
   - Accept the license agreement
   - Keep default installation path: `C:\Program Files\nodejs\`
   - **IMPORTANT**: Make sure "Add to PATH" is checked (it's enabled by default)
   - Click "Install"
   - Click "Finish"

### Option B: Install via Winget (if you have Windows Package Manager)

Open PowerShell and run:
```powershell
winget install OpenJS.NodeJS.LTS
```

### Verify Installation

After installation, **close and reopen** your terminal (or open a new Command Prompt), then run:

```cmd
node --version
npm --version
```

You should see output like:
```
v20.11.0
10.2.4
```

If you see these version numbers, Node.js and npm are installed correctly! ✅

---

## STEP 2: Navigate to PRISM Labs Directory

Open Command Prompt or PowerShell and run:

```cmd
cd C:\Users\jedidiah\prism-labs-website
```

Or if you're already in the parent directory:
```cmd
cd prism-labs-website
```

Verify you're in the right place:
```cmd
dir
```

You should see files like: `package.json`, `server.js`, `README.md`, etc.

---

## STEP 3: Install npm Dependencies

This downloads all the libraries the project needs (Express, database driver, authentication, etc.)

Run this command:

```cmd
npm install
```

**What this does**:
- Reads `package.json`
- Downloads ~30 packages (express, better-sqlite3, passport, etc.)
- Creates `node_modules/` folder (this will be large, ~150MB)
- Creates `package-lock.json` (version lockfile)

**This will take 2-5 minutes** depending on your internet speed.

**Expected output**:
```
added 156 packages, and audited 157 packages in 45s

23 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

If you see errors:
- **Network errors**: Try again, or check your internet connection
- **Python errors**: Some packages need build tools. Install Windows Build Tools:
  ```cmd
  npm install --global windows-build-tools
  ```
  (This takes 10-15 minutes)

---

## STEP 4: Create Environment Configuration

The project needs a `.env` file with API keys and secrets.

### Option A: Copy the Template

```cmd
copy .env.example .env
```

### Option B: Create Manually

Open Notepad and paste this:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Database
DATABASE_PATH=./data/prism-labs.db

# Session Secret (change this in production!)
SESSION_SECRET=prism-labs-dev-secret-change-in-production-2026

# Microsoft 365 OAuth (OPTIONAL for local dev - can leave blank for now)
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_REDIRECT_URI=http://localhost:3000/auth/microsoft/callback

# Resend API (OPTIONAL for local dev - can leave blank for now)
RESEND_API_KEY=
FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=jedidiah@asdah.school.nz

# GitHub Integration (OPTIONAL for local dev)
GITHUB_TOKEN=
GITHUB_ORG=jvinzon

# Google Calendar (OPTIONAL for local dev)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALENDAR_ID=

# Microsoft Teams (OPTIONAL for local dev)
TEAMS_WEBHOOK_URL=

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Security
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=7d
```

Save it as: `C:\Users\jedidiah\prism-labs-website\.env`

**IMPORTANT**: Make sure the file is named `.env` (not `.env.txt`)

---

## STEP 5: Initialize the Database

This creates the SQLite database with all tables and pre-loads badges/categories.

Run:

```cmd
npm run init-db
```

**What this does**:
- Creates `data/` directory
- Creates `data/prism-labs.db` (SQLite database file)
- Creates 20+ tables (users, badges, events, attendance, etc.)
- Inserts 17 achievement badges
- Inserts 6 forum categories
- Inserts integration configs

**Expected output**:
```
Creating database schema...
Inserting default data...
Database initialized successfully!
Database location: ./data/prism-labs.db
```

If you see errors:
- **"Cannot find module 'better-sqlite3'"**: Run `npm install` again
- **"Permission denied"**: Make sure you're in the right directory
- **"SQL error"**: Delete `data/` folder and run again

---

## STEP 6: Create First Admin User

You need to manually create the first admin account in the database.

### Option A: Use SQLite Viewer (Easiest)

1. Download "DB Browser for SQLite" from https://sqlitebrowser.org/
2. Install and open it
3. Click "Open Database" → Navigate to `C:\Users\jedidiah\prism-labs-website\data\prism-labs.db`
4. Click "Execute SQL" tab
5. Paste this SQL:

```sql
INSERT INTO users (id, email, name, role, year_level)
VALUES ('admin-001', 'jedidiah@asdah.school.nz', 'Jedidiah Vinzon', 'admin', NULL);
```

6. Click the "Play" button (▶️) to execute
7. Click "Write Changes" button (💾) to save
8. Close DB Browser

### Option B: Create a Script

Create a file `scripts/create-admin.js`:

```javascript
const db = require('../db');

const admin = {
  id: 'admin-001',
  email: 'jedidiah@asdah.school.nz',
  name: 'Jedidiah Vinzon',
  role: 'admin'
};

try {
  db.prepare(`
    INSERT INTO users (id, email, name, role)
    VALUES (?, ?, ?, ?)
  `).run(admin.id, admin.email, admin.name, admin.role);
  
  console.log('✅ Admin user created successfully!');
  console.log(`Email: ${admin.email}`);
  console.log('You can now log in with Microsoft 365 or create a password.');
} catch (err) {
  if (err.message.includes('UNIQUE constraint failed')) {
    console.log('⚠️  Admin user already exists!');
  } else {
    console.error('Error:', err.message);
  }
}

db.close();
```

Then run:
```cmd
node scripts/create-admin.js
```

---

## STEP 7: Start the Development Server

Now everything is ready! Start the server:

```cmd
npm run dev
```

**What this does**:
- Starts Node.js server with `nodemon` (auto-restart on file changes)
- Loads Express application
- Connects to SQLite database
- Starts listening on port 3000

**Expected output**:
```
[nodemon] starting `node server.js`

🌈 PRISM Labs Server running on http://localhost:3000

📊 Database: ./data/prism-labs.db

🚀 Ready to launch!
```

If you see errors:
- **"Port 3000 already in use"**: Either:
  - Change `PORT=3001` in `.env`, or
  - Find and kill the process using port 3000:
    ```cmd
    netstat -ano | findstr :3000
    taskkill /PID <PID> /F
    ```
- **"Cannot find module"**: Run `npm install` again
- **".env not found"**: Make sure `.env` file exists in the project root

---

## STEP 8: Test the Website

Open your web browser and go to:

**http://localhost:3000**

You should see:
- ✅ PRISM Labs homepage with hero section
- ✅ "Four Tracks" grid (Programming, Refurbishing, Innovation, Systems)
- ✅ "When & Where" section with session times
- ✅ Navigation bar with logo
- ✅ Footer with links

### Test Navigation

Click around to test:
1. **About** → `/about` - Should show mission, values, leadership
2. **Resources** → `/resources` - Public resource library
3. **Events** → `/calendar` - Public event calendar
4. **Join Now** → `/join` - Registration form (not yet created)

### Test Login

Click "Dashboard" or go to `/auth/login`:
- Should see login page
- "Sign in with Microsoft 365" button (won't work until OAuth is configured)
- Manual registration form

---

## STEP 9: Verify Everything Works

### Check Database

Run this to verify database was created:

```cmd
dir data
```

You should see:
```
prism-labs.db
prism-labs.db-shm
prism-labs.db-wal
```

### Check Node Modules

```cmd
dir node_modules | find "express"
dir node_modules | find "better-sqlite3"
dir node_modules | find "passport"
```

Should show these packages are installed.

### Test API Endpoints

Open browser and go to:
- **http://localhost:3000/api/resources** - Should return `[]` (empty array)
- **http://localhost:3000/api/events** - Should return `[]`
- **http://localhost:3000/api/badges** - Should return 17 badges

---

## TROUBLESHOOTING

### Problem: "npm is not recognized"

**Solution**: Node.js isn't installed or not in PATH.
- Reinstall Node.js from https://nodejs.org/
- Make sure to check "Add to PATH" during installation
- **Restart your terminal** after installation

### Problem: "EACCES permission denied"

**Solution**: Run terminal as Administrator.
- Right-click Command Prompt → "Run as administrator"
- Or use PowerShell as admin

### Problem: "Cannot find module 'better-sqlite3'"

**Solution**: Native module didn't compile. Run:
```cmd
npm install --rebuild
```

Or install build tools:
```cmd
npm install --global windows-build-tools
```
Then:
```cmd
npm install
```

### Problem: "Port 3000 already in use"

**Solution**: Something else is using port 3000.
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change port in `.env`:
```
PORT=3001
```

### Problem: Database locked error

**Solution**: Close any programs using the database (like DB Browser for SQLite), then:
```cmd
del data\*.db-wal data\*.db-shm
npm run dev
```

---

## WHAT'S NEXT AFTER INSTALLATION?

Once the server is running successfully:

### 1. Create Remaining View Templates
The backend is complete, but many view templates are missing. Start with:
- `views/members/dashboard.ejs`
- `views/admin/dashboard.ejs`
- `views/join.ejs`

### 2. Configure Microsoft 365 OAuth
Follow the README.md instructions to set up Azure AD app registration.

### 3. Add Sample Data
Create some test events, resources, and forum posts to populate the site.

### 4. Deploy to Production
When ready, deploy to Railway.app, Render.com, or your school server.

---

## QUICK REFERENCE COMMANDS

```cmd
# Install dependencies
npm install

# Initialize database
npm run init-db

# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# View installed packages
npm list

# Update packages
npm update

# Check for vulnerabilities
npm audit
```

---

## SUCCESS CHECKLIST

- [ ] Node.js installed (`node --version` shows v18+)
- [ ] npm installed (`npm --version` shows 8+)
- [ ] In project directory (`dir` shows package.json)
- [ ] Dependencies installed (`node_modules/` folder exists)
- [ ] `.env` file created and configured
- [ ] Database initialized (`data/prism-labs.db` exists)
- [ ] Admin user created in database
- [ ] Server starts without errors (`npm run dev`)
- [ ] Homepage loads in browser (http://localhost:3000)
- [ ] API endpoints return data

If all checkboxes are ✅, you're ready to start developing! 🎉

---

**Need Help?**
- Check the main README.md for detailed documentation
- Review IMPLEMENTATION_SUMMARY.md for what's built vs. pending
- Contact: fine@asdah.school.nz
