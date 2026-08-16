# 🚂 PRISM Labs - Railway.app Deployment Guide

## OVERVIEW

Railway.app is a cloud hosting platform that deploys directly from GitHub. Perfect for Node.js apps!

**Pricing:** 
- Trial: $5 credit (about 500 hours of usage)
- Hobby: $5/month after trial
- More info: https://railway.app/pricing

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Step 1: Push to GitHub First!

Railway deploys from GitHub, so you MUST push your code first:

```cmd
cd C:\Users\jedidiah\prism-labs-website

# Initialize git (if not done)
git init
git add .
git commit -m "PRISM Labs v2.0 - Ready for deployment"

# Create repo on github.com (don't initialize with README)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/prism-labs-website.git
git branch -M main
git push -u origin main
```

### Step 2: Create .env File

Railway needs environment variables. Create `.env` locally first:

```cmd
copy .env.example .env
```

Edit `.env` with at minimum:
```
PORT=3000
SESSION_SECRET=your-super-secret-key-change-this-in-production-12345
DATABASE_PATH=./data/prism-labs.db
```

**DO NOT commit `.env` to GitHub!** (It's in .gitignore)

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended) or email

### Step 2: Create New Project

1. Click **"+ New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select `prism-labs-website`
4. Click **"Deploy Now"**

### Step 3: Configure Environment Variables

Railway will start building your app. While it builds:

1. Click on your project name
2. Go to **"Variables"** tab
3. Add these variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` (Railway auto-sets this) |
| `SESSION_SECRET` | Generate a random string (see below) |
| `DATABASE_PATH` | `./data/prism-labs.db` |

**Generate SESSION_SECRET:**
- Use a random string like: `prism-labs-secret-2026-` + random numbers
- Or use: https://generate-secret.vercel.app/32

### Step 4: Configure Build & Start

Railway auto-detects Node.js apps, but verify:

1. Go to **"Settings"** tab
2. Check **"Build Command"**: Should be `npm install`
3. Check **"Start Command"**: Should be `npm start`

If not set, add these to your `package.json`:
```json
"scripts": {
  "start": "node server.js",
  "build": "npm install"
}
```

### Step 5: Initialize Database

**IMPORTANT:** Railway needs to create the database on first deploy.

Add a postinstall script to auto-initialize:

In `package.json`, add:
```json
"scripts": {
  "postinstall": "node scripts/init-db-simple.js"
}
```

This runs automatically after `npm install` on Railway.

### Step 6: Wait for Deploy

1. Railway will build your app (2-5 minutes)
2. Watch the **"Deployments"** tab for progress
3. When you see **"SUCCESS"** with a green checkmark, it's ready!

### Step 7: Get Your Live URL

1. Go to **"Settings"** tab
2. Find **"Domains"** section
3. Click **"Generate Domain"**
4. Your URL will be: `https://prism-labs-website-production.up.railway.app`

### Step 8: Test Your Site!

1. Click the Railway domain URL
2. You should see the PRISM Labs homepage
3. Test a few pages:
   - `/members/paths` - Learning paths
   - `/members/gamification/leaderboard/individual` - Leaderboard

---

## 🔧 CONFIGURATION FILES

I've created these files for you:

### 1. `railway.json` (Auto-created)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. `Procfile` (Alternative to package.json scripts)
```
web: node server.js
```

### 3. `.env.example` (Already created)
```
PORT=3000
SESSION_SECRET=change-this-to-random-string
DATABASE_PATH=./data/prism-labs.db
```

---

## ⚠️ IMPORTANT NOTES

### Database Persistence

**sql.js stores data in files.** Railway has ephemeral storage, so:

**Option A: Use Railway's Persistent Volume** (Recommended)
1. Go to project settings
2. Click "Volumes"
3. Add a volume: `/app/data` (1GB free)
4. Set `DATABASE_PATH=/app/data/prism-labs.db`

**Option B: Use External Database** (For production)
- Switch to PostgreSQL (Railway has built-in Postgres)
- Or use a cloud SQLite service

### Environment Variables

**NEVER commit `.env` to GitHub!** Railway has a Variables tab for this.

### Port Configuration

Railway auto-sets the `PORT` variable. Your app should use:
```javascript
const PORT = process.env.PORT || 3000;
```

### Build Logs

If deployment fails:
1. Go to **"Deployments"** tab
2. Click the failed deployment
3. Scroll through logs to find errors
4. Common issues:
   - Missing dependencies → Check `package.json`
   - Build script errors → Check `postinstall`
   - Port issues → Check `PORT` variable

---

## 🆘 TROUBLESHOOTING

### "Build Failed"
**Cause:** Missing dependencies or syntax errors
**Fix:** Check deployment logs, run `npm install` locally first

### "App Crashes on Start"
**Cause:** Missing environment variables
**Fix:** Add all required variables in Railway Variables tab

### "Database Not Found"
**Cause:** sql.js file storage issue
**Fix:** Add persistent volume (see above)

### "Port Already in Use"
**Cause:** Hardcoded port
**Fix:** Use `process.env.PORT`

### "Module Not Found"
**Cause:** Missing package in package.json
**Fix:** Add to dependencies, push to GitHub

---

## 📊 POST-DEPLOYMENT

### 1. Create Admin User

After first deploy, create your admin account:

**Option A: Railway Shell**
1. Go to project settings
2. Click "Shell"
3. Run:
```bash
node -e "
const { createDatabase } = require('./db');
(async () => {
  const db = await createDatabase();
  db.prepare(\"INSERT INTO users (id, email, name, role) VALUES ('admin-001', 'jedidiah@asdah.school.nz', 'Jedidiah Vinzon', 'admin')\").run();
  db.close();
  console.log('Admin created!');
})();
"
```

**Option B: Add to init-db-simple.js** (Already included!)

### 2. Set Up Custom Domain (Optional)

1. Buy domain (e.g., prismlabs.asdah.school.nz)
2. In Railway Settings → Domains
3. Click "Add Custom Domain"
4. Follow DNS instructions
5. Wait 24-48 hours for propagation

### 3. Enable Auto-Deploy

Railway auto-deploys when you push to GitHub!

- Push to `main` branch → Auto-deploy to production
- Create `staging` branch → Deploy to staging environment

### 4. Monitor Usage

1. Go to project dashboard
2. Check "Usage" tab
3. Monitor:
   - Compute hours
   - Bandwidth
   - Storage

---

## 🎯 QUICK DEPLOY CHECKLIST

- [ ] Code pushed to GitHub
- [ ] `.env` created locally (not committed)
- [ ] `package.json` has start script
- [ ] `railway.json` created (I'll make this)
- [ ] GitHub repo is public (or Railway connected)
- [ ] Environment variables ready
- [ ] Database initialization script ready

---

## 📞 NEXT STEPS

After deploying:

1. **Test all features** on live site
2. **Share URL** with students/colleagues
3. **Set up Microsoft 365 OAuth** for real authentication
4. **Add content** (learning paths, challenges, blog posts)
5. **Monitor usage** and upgrade if needed

---

## 🔗 USEFUL LINKS

- Railway Docs: https://docs.railway.app
- Node.js Guide: https://docs.railway.app/guides/nodejs
- Environment Variables: https://docs.railway.app/develop/variables
- Persistent Volumes: https://docs.railway.app/guides/volumes
- Pricing: https://railway.app/pricing

---

**Ready to deploy?** Let me know if you need help with any step! 🚀
