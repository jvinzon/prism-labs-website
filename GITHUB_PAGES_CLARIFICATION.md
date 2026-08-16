# ⚠️ IMPORTANT: GitHub Pages vs Railway.app

## 🚫 GITHUB PAGES WON'T WORK FOR PRISM LABS

### Why?

**GitHub Pages** only hosts **static websites** (HTML, CSS, JavaScript files).

**PRISM Labs** is a **Node.js application** with:
- ❌ Backend server (Express.js)
- ❌ Database (sql.js)
- ❌ Server-side rendering (EJS templates)
- ❌ User authentication
- ❌ Session management
- ❌ Dynamic content

These require a **server runtime** which GitHub Pages doesn't provide!

---

## ✅ YOU NEED RAILWAY.APP (OR SIMILAR)

### Platforms that CAN run Node.js apps:

| Platform | Free Tier | Node.js Support | Ease |
|----------|-----------|-----------------|------|
| **Railway.app** | $5 credit | ✅ Full support | ⭐⭐⭐⭐⭐ |
| **Render.com** | Free tier | ✅ Full support | ⭐⭐⭐⭐ |
| **Heroku** | Paid only | ✅ Full support | ⭐⭐⭐ |
| **Vercel** | Free tier | ⚠️ Limited (serverless only) | ⭐⭐⭐ |
| **GitHub Pages** | Free | ❌ NO | N/A |

---

## 🚀 DEPLOY TO RAILWAY.APP INSTEAD

### Step 1: Your Code is Already on GitHub ✅
You've already pushed to GitHub - perfect!

### Step 2: Go to Railway.app
1. Visit: https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub

### Step 3: Deploy from GitHub
1. Click "Deploy from GitHub repo"
2. Find and select `prism-labs-website`
3. Click "Deploy Now"

### Step 4: Add Environment Variables
In Railway dashboard → Variables tab, add:

```
NODE_ENV=production
SESSION_SECRET=your-random-secret-string-here
ADMIN_EMAIL=jedidiah@asdah.school.nz
ADMIN_PIN=123456
DATABASE_PATH=/app/data/prism-labs.db
```

### Step 5: Add Persistent Volume (CRITICAL!)
1. Go to Settings → Volumes
2. Click "Add Volume"
3. Mount path: `/app/data`
4. Size: 1 GB
5. This stores your database permanently!

### Step 6: Wait for Deploy
- Railway will build your app (2-5 minutes)
- Watch Deployments tab for green checkmark ✅

### Step 7: Get Your Live URL
1. Go to Settings → Domains
2. Click "Generate Domain"
3. Your URL: `https://prism-labs-production.up.railway.app`

### Step 8: Test!
Visit your Railway URL and test:
- Homepage loads
- Admin login (footer link)
- Email: jedidiah@asdah.school.nz
- PIN: 123456

---

## 📋 WHAT WENT WRONG

### You Did:
```
Push to GitHub → Visit GitHub Pages URL → Nothing works
```

### Why It Doesn't Work:
- GitHub Pages URL: `https://yourusername.github.io/prism-labs-website/`
- This only serves static files
- Your `server.js` never runs
- Your database never initializes
- Your EJS templates never render

### What You Should Do:
```
Push to GitHub → Deploy to Railway → Get Railway URL → Everything works! ✅
```

---

## 🔧 IF YOU ALREADY ENABLED GITHUB PAGES

### Disable GitHub Pages:
1. Go to your repo on GitHub
2. Settings → Pages
3. Source: Select "None"
4. Save

### Enable Railway Instead:
Follow the steps above!

---

## 📞 QUICK REFERENCE

**GitHub Repo:** `https://github.com/YOUR_USERNAME/prism-labs-website`
✅ Already done!

**GitHub Pages:** `https://YOUR_USERNAME.github.io/prism-labs-website/`
❌ Won't work - don't use this!

**Railway.app:** `https://prism-labs-production.up.railway.app`
✅ This is where your live site will be!

---

## 📄 HELPFUL DOCUMENTS

I created these guides for you:
- `RAILWAY_DEPLOYMENT.md` - Complete Railway guide
- `DEPLOY_CHECKLIST.md` - Quick reference checklist
- `GITHUB_DEPLOYMENT_CHECKLIST.md` - What to push (you already did this!)

---

**Next Step: Go to Railway.app and deploy!** 🚀

Your code is ready - you just need the right hosting platform!
