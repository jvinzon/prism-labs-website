# PRISM Labs Website - Quick Start Checklist

## BEFORE YOU START
- [ ] You have internet connection
- [ ] You have 200MB free disk space
- [ ] You have 10-15 minutes for installation

---

## STEP 1: Install Node.js (5 minutes)

### Download Node.js
- [ ] Go to https://nodejs.org/
- [ ] Click the green "LTS" button (recommended version)
- [ ] Wait for download to complete

### Install Node.js
- [ ] Double-click the downloaded .msi file
- [ ] Click "Next" through the wizard
- [ ] Accept license agreement
- [ ] Keep default settings (ensure "Add to PATH" is checked)
- [ ] Click "Install"
- [ ] Click "Finish"

### Verify Installation
- [ ] Close and reopen your terminal (important!)
- [ ] Open Command Prompt or PowerShell
- [ ] Type: node --version
- [ ] You should see: v20.x.x (or similar)
- [ ] Type: npm --version
- [ ] You should see: 10.x.x (or similar)

**If you see version numbers, Node.js is installed!**

---

## STEP 2: Run Automated Installer (3-5 minutes)

### Open Project Folder
- [ ] Open File Explorer
- [ ] Navigate to: C:\Users\jedidiah\prism-labs-website
- [ ] You should see files like: package.json, server.js, README.md

### Run Installation Script

**Option A: PowerShell (Recommended)**
- [ ] Right-click in folder -> "Open in Terminal"
- [ ] Type: .\install.ps1
- [ ] Press Enter
- [ ] Wait for installation

**Option B: Command Prompt**
- [ ] Type: install.cmd
- [ ] Press Enter

**Option C: Manual**
```
npm install
copy .env.example .env
npm run init-db
```

---

## STEP 3: Verify Installation

- [ ] node_modules folder exists (large folder)
- [ ] data folder exists
- [ ] data\prism-labs.db file exists
- [ ] .env file exists

---

## STEP 4: Create Admin User

**Using DB Browser for SQLite:**
- [ ] Download from: https://sqlitebrowser.org/
- [ ] Open data\prism-labs.db
- [ ] Click "Execute SQL" tab
- [ ] Paste:
  INSERT INTO users (id, email, name, role)
  VALUES ('admin-001', 'jedidiah@asdah.school.nz', 'Jedidiah Vinzon', 'admin');
- [ ] Click Play button
- [ ] Click Save button

---

## STEP 5: Start Server

- [ ] Open terminal in project folder
- [ ] Type: npm run dev
- [ ] Press Enter
- [ ] Wait for: "Server running on http://localhost:3000"

---

## STEP 6: Test Website

- [ ] Open browser
- [ ] Go to: http://localhost:3000
- [ ] See PRISM Labs homepage
- [ ] Click "About" -> see about page
- [ ] Click "Resources" -> see resources
- [ ] Go to: http://localhost:3000/auth/login
- [ ] See login page

**All working? Installation successful!**

---

## Troubleshooting

**"npm is not recognized"**
-> Reinstall Node.js, restart terminal

**"Port 3000 already in use"**
-> Run: netstat -ano | findstr :3000
-> Then: taskkill /PID <number> /F

**"Cannot find module"**
-> Run: npm install --rebuild

**Database locked**
-> Close DB Browser
-> Delete: data\*.db-wal and data\*.db-shm

---

## Quick Commands

Start server: npm run dev
Stop server: Ctrl + C
Reinstall: npm install
Reset DB: npm run init-db

---

## Files Created

- INSTALL_GUIDE.md (detailed steps)
- install.ps1 (PowerShell script)
- install.cmd (Command Prompt script)
- This checklist

See INSTALL_GUIDE.md for full details!
