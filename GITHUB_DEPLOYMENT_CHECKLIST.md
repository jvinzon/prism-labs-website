# 🚀 PRISM Labs - GitHub Deployment Checklist

## ✅ WHAT TO PUSH TO GITHUB

### Files to Include:
- ✅ All source code (`.js`, `.ejs`)
- ✅ `package.json` (dependencies list)
- ✅ `.gitignore` (exclusion rules)
- ✅ `.env.example` (template - NO real secrets!)
- ✅ Documentation (README, guides, etc.)
- ✅ Public assets (CSS, JS, images)
- ✅ Scripts (`scripts/*.js`)

### Files to EXCLUDE (in .gitignore):
- ❌ `.env` (contains admin PIN, API keys, secrets)
- ❌ `node_modules/` (reinstall with `npm install`)
- ❌ `data/*.db` (local database, regenerate on deploy)
- ❌ `uploads/` (user files)
- ❌ `logs/` (log files)

---

## 📋 PRE-PUSH CHECKLIST

### 1. Verify .gitignore
```cmd
# Make sure these are in .gitignore:
.env
node_modules/
data/*.db
```

### 2. Create .env from .env.example
```cmd
copy .env.example .env
```
**DO NOT COMMIT .env TO GITHUB!**

Edit `.env` with your actual credentials:
```
ADMIN_EMAIL=jedidiah@asdah.school.nz
ADMIN_PIN=123456
SESSION_SECRET=your-random-secret-here
```

### 3. Test Locally First
```cmd
npm install
node server.js
# Visit http://localhost:3000
# Test admin login
```

### 4. Initialize Git
```cmd
git init
git add .
git status
# Verify .env is NOT listed!
```

### 5. Create GitHub Repository
1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `prism-labs-website`
4. Description: "PRISM Labs Technology Club - ASDAH"
5. **DO NOT** initialize with README
6. Click "Create repository"

### 6. Push to GitHub
```cmd
git add .
git commit -m "PRISM Labs v2.0 - Complete with authentication, resources, gamification"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/prism-labs-website.git
git push -u origin main
```

---

## 🔒 SECURITY CHECK

Before pushing, verify these are NOT committed:

```cmd
# Check if .env is tracked (should NOT be):
git ls-files | grep .env

# Should only show:
# .env.example ✓ (OK to commit)
# NOT .env ✗ (should not appear)
```

---

## 🚂 AFTER PUSHING - DEPLOY TO RAILWAY

1. Go to https://railway.app
2. Sign in with GitHub
3. New Project → Deploy from GitHub
4. Select `prism-labs-website`
5. Add environment variables in Railway dashboard:
   - `ADMIN_EMAIL`
   - `ADMIN_PIN`
   - `SESSION_SECRET`
   - `DATABASE_PATH=/app/data/prism-labs.db`
6. Add persistent volume: `/app/data` (1GB)
7. Deploy!

---

## 📁 FILES CREATED FOR DEPLOYMENT

- ✅ `.gitignore` - Excludes secrets and large files
- ✅ `.env.example` - Template for environment variables
- ✅ `RAILWAY_DEPLOYMENT.md` - Complete Railway guide
- ✅ `DEPLOY_CHECKLIST.md` - Quick reference
- ✅ `install.bat` - Install dependencies locally

---

**Ready to push?** Run through the checklist above! 🚀
