# 🚀 DEPLOY PRISM LABS TO RAILWAY - COMPLETE GUIDE

## ⚡ QUICK START (5 Minutes)

Your Node.js website **CANNOT run on GitHub Pages** (static only). Deploy to Railway instead!

### Step 1: Verify GitHub Repo ✅
Your code is already at: `https://github.com/jvinzon/prism-labs-website`

### Step 2: Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub (recommended)
3. **Click "New Project"** → "Deploy from GitHub repo"
4. **Select** `prism-labs-website`
5. **Click "Deploy Now"**

### Step 3: Add Environment Variables

In Railway dashboard → Variables tab, add:

```
NODE_ENV=production
SESSION_SECRET=prism-labs-secret-2026-random-string
DATABASE_PATH=/app/data/prism-labs.db
ADMIN_EMAIL=jedidiah@asdah.school.nz
ADMIN_PIN=123456
```

### Step 4: Add Persistent Volume

1. Go to project **Settings** → **Volumes**
2. Click **"Add Volume"**
3. Mount path: `/app/data`
4. Size: `1 GB` (free tier)

### Step 5: Generate Domain

1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"**
3. Your live URL: `https://prism-labs-website-production.up.railway.app`

### Step 6: Test!

Visit your Railway URL and test:
- ✅ Homepage loads
- ✅ Member Login: `/members/login`
- ✅ Admin Login: `/admin/login`
- ✅ Admin Dashboard: `/admin/dashboard`

---

## 📋 DETAILED DEPLOYMENT GUIDE

### Why Railway Instead of GitHub Pages?

| Feature | GitHub Pages | Railway.app |
|---------|-------------|-------------|
| Static files (HTML/CSS/JS) | ✅ Yes | ✅ Yes |
| Node.js server | ❌ NO | ✅ Yes |
| Database (sql.js) | ❌ NO | ✅ Yes |
| Server-side rendering (EJS) | ❌ NO | ✅ Yes |
| Authentication/Sessions | ❌ NO | ✅ Yes |
| Dynamic routes | ❌ NO | ✅ Yes |
| Cost | Free | $5 credit (free tier) |

**Bottom line:** GitHub Pages can ONLY serve static files. Your app needs a running Node.js server.

---

## 🔧 PRE-DEPLOYMENT CHECKLIST

### 1. Verify Your Code is on GitHub ✅

```bash
cd C:\Users\jedidiah\prism-labs-website
git status
git push origin main
```

Your repo: https://github.com/jvinzon/prism-labs-website

### 2. Required Files (Already Created!)

✅ `package.json` - Dependencies and start script
✅ `server.js` - Express server entry point
✅ `railway.json` - Railway configuration
✅ `Procfile` - Alternative start command
✅ `.env.example` - Environment variables template
✅ `scripts/init-db-simple.js` - Database initialization

### 3. Configuration Files

**package.json** (already configured):
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "init-db": "node scripts/init-db-simple.js",
    "seed-resources": "node scripts/seed-resources.js"
  }
}
```

**railway.json** (already configured):
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

**Procfile** (already configured):
```
web: node server.js
```

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (easiest) or email

### Step 2: Deploy from GitHub

1. Click **"+ New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find `jvinzon/prism-labs-website` in the list
4. Click **"Deploy Now"**

Railway will:
- Clone your repo
- Install dependencies (`npm install`)
- Build your app
- Start the server

### Step 3: Configure Environment Variables

While Railway builds (takes 2-5 minutes):

1. Click on your project name
2. Go to **"Variables"** tab
3. Add these variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | `prism-labs-secret-key-2026-change-this` |
| `DATABASE_PATH` | `/app/data/prism-labs.db` |
| `ADMIN_EMAIL` | `jedidiah@asdah.school.nz` |
| `ADMIN_PIN` | `123456` |

**Generate a secure SESSION_SECRET:**
- Use: https://generate-secret.vercel.app/32
- Or make one up: `prism-labs-` + random numbers

### Step 4: Add Persistent Volume

**CRITICAL:** sql.js stores data in files. Railway's storage is temporary unless you add a volume.

1. Go to **Settings** tab
2. Scroll to **"Volumes"** section
3. Click **"Add Volume"**
4. Configure:
   - **Mount path:** `/app/data`
   - **Size:** `1 GB` (free tier is enough)
5. Click **"Add"**

This ensures your database persists between deployments!

### Step 5: Wait for Deployment

1. Go to **"Deployments"** tab
2. Watch the build logs
3. Wait for green checkmark ✅ (2-5 minutes)

If it fails:
- Click the failed deployment
- Scroll through logs to find errors
- Common issues:
  - Missing dependency → Add to `package.json`
  - Build error → Check syntax
  - Port issue → Railway auto-sets PORT

### Step 6: Generate Domain

1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"**
3. Your URL: `https://prism-labs-website-production.up.railway.app`
4. Click to open!

### Step 7: Initialize Database

After first deploy, the database needs to be created:

**Option A: Railway auto-runs postinstall** (if configured)

Add to `package.json`:
```json
"scripts": {
  "postinstall": "node scripts/init-db-simple.js"
}
```

**Option B: Manual initialization via Railway Shell**

1. Go to **Settings** → **Shell**
2. Click **"Open Shell"**
3. Run:
```bash
node scripts/init-db-simple.js
```

This creates:
- Database tables
- Test admin user (jedidiah@asdah.school.nz)
- Test student user

---

## ✅ FEATURES AVAILABLE ON RAILWAY

Your deployed site will have:

### Public Pages
- ✅ Homepage with hero section
- ✅ About page
- ✅ Navigation with "Member Login" button
- ✅ Footer with discreet "Admin Login" link

### Member Features
- ✅ Member Login (`/members/login`) - Microsoft 365 OAuth
- ✅ Member Dashboard (`/members/dashboard`)
- ✅ Learning Paths (`/members/paths`)
- ✅ Resource Library (`/members/resources`)
- ✅ Bookmarks (`/members/bookmarks`)
- ✅ Gamification (`/members/gamification/leaderboard`)
- ✅ Challenges (`/members/challenges`)
- ✅ Teams (`/members/teams`)
- ✅ Social Feed (`/members/social`)
- ✅ Shop (`/members/shop`)
- ✅ XP Profile (`/members/xp-profile`)

### Admin Features
- ✅ Admin Login (`/admin/login`) - Email + PIN
- ✅ Admin Dashboard (`/admin/dashboard`)
- ✅ Admin Tools Menu
- ✅ User Management
- ✅ Resource Management
- ✅ Analytics

### Authentication
- ✅ Member: Microsoft 365 OAuth (requires Azure setup)
- ✅ Admin: Email + PIN (configured via environment variables)
- ✅ Session management
- ✅ Protected routes
- ✅ Flash messages

---

## 🔒 SECURITY CHECKLIST

Before going live:

### 1. Change Default Credentials
```env
ADMIN_PIN=123456  # ← Change this!
SESSION_SECRET=prism-labs-secret-key-2026-change-this  # ← Generate random string
```

### 2. Environment Variables
- ✅ `.env` is in `.gitignore` (NOT committed to GitHub)
- ✅ Secrets added in Railway Variables tab
- ✅ Azure OAuth credentials (when configured)

### 3. Database
- ✅ Persistent volume mounted at `/app/data`
- ✅ Database file: `/app/data/prism-labs.db`

---

## 🆘 TROUBLESHOOTING

### "Build Failed"
**Cause:** Missing dependencies or syntax errors
**Fix:**
1. Check deployment logs
2. Run `npm install` locally first
3. Verify all dependencies in `package.json`

### "App Crashes on Start"
**Cause:** Missing environment variables
**Fix:**
1. Go to Variables tab
2. Add: `NODE_ENV`, `SESSION_SECRET`, `DATABASE_PATH`
3. Redeploy

### "Database Not Found"
**Cause:** sql.js file storage issue
**Fix:**
1. Add persistent volume (see Step 4)
2. Set `DATABASE_PATH=/app/data/prism-labs.db`
3. Run `node scripts/init-db-simple.js` in shell

### "Port Already in Use"
**Cause:** Hardcoded port
**Fix:** Your `server.js` already uses `process.env.PORT` ✅

### "Module Not Found"
**Cause:** Missing package
**Fix:**
```bash
npm install <package-name>
git add package.json package-lock.json
git commit -m "Add <package-name>"
git push
```
Railway auto-deploys on push!

### "CSS Not Loading"
**Cause:** Static files not served
**Fix:** Your `server.js` already has:
```javascript
app.use(express.static(path.join(__dirname, 'public')));
```
✅ This is already configured!

---

## 📊 POST-DEPLOYMENT TASKS

### 1. Test All Features

Visit your Railway URL and test:

```
Homepage:              https://your-app.up.railway.app/
Member Login:          https://your-app.up.railway.app/members/login
Admin Login:           https://your-app.up.railway.app/admin/login
Admin Dashboard:       https://your-app.up.railway.app/admin/dashboard
Learning Paths:        https://your-app.up.railway.app/members/paths
Resource Library:      https://your-app.up.railway.app/members/resources
Leaderboard:           https://your-app.up.railway.app/members/gamification/leaderboard/individual
```

### 2. Set Up Microsoft 365 OAuth (for Member Login)

To enable real Microsoft login:

1. Go to Azure Portal: https://portal.azure.com
2. Register new app
3. Get credentials:
   - Tenant ID
   - Client ID
   - Client Secret
4. Add to Railway Variables:
```
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
```
5. Set redirect URI: `https://your-app.up.railway.app/auth/microsoft/callback`

### 3. Share Your Live URL

Once tested:
- Share Railway URL with students
- Add to school newsletter
- Update any documentation

### 4. Monitor Usage

1. Go to Railway dashboard
2. Check **"Usage"** tab
3. Monitor:
   - Compute hours (free tier: ~500 hours)
   - Bandwidth
   - Storage (1 GB free)

### 5. Auto-Deploy on Push

Railway automatically deploys when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Railway auto-deploys! ✅
```

---

## 🎯 CUSTOM DOMAIN (Optional)

Want a professional URL like `prismlabs.asdah.school.nz`?

### Step 1: Buy Domain
- Purchase from domain registrar
- Or use school subdomain

### Step 2: Configure in Railway
1. Go to **Settings** → **Domains**
2. Click **"Add Custom Domain"**
3. Enter: `prismlabs.asdah.school.nz`
4. Railway shows DNS records

### Step 3: Update DNS
Add these records at your domain registrar:

```
Type: CNAME
Name: prismlabs (or @)
Value: your-app-production.up.railway.app
TTL: 3600
```

### Step 4: Wait for Propagation
- Takes 24-48 hours
- Check: https://dnschecker.org

### Step 5: Enable HTTPS
Railway auto-provisions SSL certificate! ✅

---

## 💰 COST BREAKDOWN

### Railway Free Tier
- **$5 credit** (about 500 hours of usage)
- **1 GB storage** (persistent volume)
- **Enough for:** 2-3 months of school club usage

### After Free Tier
- **Hobby plan:** $5/month
- **Pay-as-you-go:** ~$0.005/hour

### Comparison
| Platform | Cost | For PRISM Labs |
|----------|------|----------------|
| GitHub Pages | Free | ❌ Static only |
| Railway | $5 credit | ✅ Perfect |
| Render | Free tier | Good alternative |
| Heroku | $7/month | Expensive |

---

## 📞 QUICK REFERENCE

### Your URLs
- **GitHub Repo:** https://github.com/jvinzon/prism-labs-website
- **Railway Deploy:** https://railway.app
- **Live Site:** `https://prism-labs-website-production.up.railway.app`

### Test Credentials
- **Admin Email:** `jedidiah@asdah.school.nz`
- **Admin PIN:** `123456` (CHANGE THIS!)

### Important Files
- `server.js` - Express server
- `package.json` - Dependencies
- `railway.json` - Railway config
- `.env.example` - Environment template
- `scripts/init-db-simple.js` - DB init

### Commands
```bash
# Local testing
npm install
npm start

# Deploy to Railway
git push origin main  # Auto-deploys!

# Initialize database
node scripts/init-db-simple.js
```

---

## 🎉 SUMMARY

### What You Have ✅
- Complete Node.js website with all features
- Code pushed to GitHub
- Railway configuration files ready
- Database initialization script

### What You Need to Do
1. Deploy to Railway (5 minutes)
2. Add environment variables
3. Add persistent volume
4. Test all features
5. Share live URL

### What You'll Get
- ✅ Live website with ALL Node.js features
- ✅ Member login (Microsoft OAuth)
- ✅ Admin login (Email + PIN)
- ✅ Dashboards, resources, gamification
- ✅ Auto-deploy on push
- ✅ HTTPS domain
- ✅ One URL for everything

---

## 🔗 USEFUL LINKS

- Railway Docs: https://docs.railway.app
- Node.js Guide: https://docs.railway.app/guides/nodejs
- Environment Variables: https://docs.railway.app/develop/variables
- Persistent Volumes: https://docs.railway.app/guides/volumes
- Pricing: https://railway.app/pricing

---

**Ready to deploy?** Follow the steps above and your site will be live in 5 minutes! 🚀

**Questions?** Check troubleshooting section or Railway docs.
