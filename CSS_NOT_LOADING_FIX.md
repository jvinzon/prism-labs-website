# 🎨 CSS Not Loading on Live Site - Troubleshooting Guide

## The Problem:
Your website is live on your custom domain, but there's **no design/styling** - just plain HTML.

---

## 🔍 Most Likely Causes

### 1. Static Files Not Being Served
Express needs to serve files from the `public/` folder.

**Check your `server.js`:**
```javascript
// This line MUST be present:
app.use(express.static(path.join(__dirname, 'public')));
```

### 2. CSS Files Not in `public/css/`
Files must be in the correct location:
```
prism-labs-website/
├── public/
│   ├── css/
│   │   ├── main.css     ← Must be here!
│   │   └── themes.css   ← Must be here!
│   ├── js/
│   │   └── themes.js
│   └── img/
│       └── prism-logo.svg
```

### 3. Wrong Paths in EJS Templates
**Check your `<link>` tags:**
```html
<!-- ✅ CORRECT (no leading slash issues): -->
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/themes.css">

<!-- ❌ WRONG: -->
<link rel="stylesheet" href="css/main.css">  (missing /)
<link rel="stylesheet" href="../public/css/main.css"> (relative path)
```

### 4. Files Not Deployed to Railway
Sometimes files don't get deployed properly.

**Check on Railway:**
1. Go to Railway dashboard
2. Click on your project
3. Click "Deployments"
4. Click the latest deployment
5. Click "Open Shell"
6. Run: `ls -la public/css/`
7. You should see: `main.css` and `themes.css`

If files are missing, they weren't pushed to GitHub!

### 5. Browser Caching
Your browser might be caching the old (broken) version.

**Fix:**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear browser cache
- Or open in incognito/private mode

---

## ✅ STEP-BY-STEP FIX

### Step 1: Verify Files Exist Locally

Run this in your project folder:
```cmd
dir public\css
```

You should see:
```
main.css
themes.css
```

**If files are missing**, I need to recreate them!

### Step 2: Check server.js Has Static Files Line

Open `server.js` and verify this line exists:
```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

**If missing**, add it after the middleware section.

### Step 3: Check EJS Templates Use Correct Paths

Open `views/layouts/main.ejs` and verify:
```html
<head>
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/themes.css">
</head>
```

### Step 4: Push to GitHub (If Files Were Missing)

```cmd
git add .
git commit -m "Add CSS files"
git push
```

Railway will auto-deploy when you push!

### Step 5: Check Railway Logs

1. Go to Railway dashboard
2. Click your project
3. Click "Deployments"
4. Click latest deployment
5. Scroll through logs
6. Look for errors like:
   - "Cannot find module"
   - "ENOENT: no such file or directory"
   - "Failed to load CSS"

### Step 6: Test CSS Directly

Visit these URLs on your live site:
```
https://YOUR-CUSTOM-DOMAIN.com/css/main.css
https://YOUR-CUSTOM-DOMAIN.com/css/themes.css
```

**If you see CSS code:** ✅ CSS is being served correctly
**If you see 404 error:** ❌ CSS files not found (check Steps 1-4)

### Step 7: Check Browser Console

1. Open your live site
2. Press `F12` (open DevTools)
3. Click "Console" tab
4. Look for errors like:
   - "Failed to load resource: net::ERR_ABORTED"
   - "404 Not Found" for CSS files

---

## 🚨 COMMON RAILWAY-SPECIFIC ISSUES

### Issue 1: Case Sensitivity

Railway runs on Linux (case-sensitive), Windows is case-insensitive.

**Wrong:**
```
public/CSS/main.css  (uppercase CSS)
```

**Correct:**
```
public/css/main.css  (lowercase css)
```

**And in EJS:**
```html
<!-- ✅ Correct: -->
<link rel="stylesheet" href="/css/main.css">

<!-- ❌ Wrong: -->
<link rel="stylesheet" href="/CSS/main.css">
```

### Issue 2: Build Command

Railway needs to know how to build your app.

**Check Railway Settings:**
- Build Command: `npm install`
- Start Command: `node server.js`

### Issue 3: Environment Variables

Make sure these are set in Railway Variables tab:
```
NODE_ENV=production
SESSION_SECRET=your-secret-here
ADMIN_EMAIL=jedidiah@asdah.school.nz
ADMIN_PIN=123456
DATABASE_PATH=/app/data/prism-labs.db
```

### Issue 4: Persistent Volume

For the database (not CSS, but important):
- Mount Path: `/app/data`
- Size: 1 GB

---

## 🔧 QUICK FIX SCRIPT

If CSS files are missing, run this locally:

```cmd
# Verify files exist
dir public\css\main.css
dir public\css	hemes.css

# If missing, tell me and I'll recreate them!

# Then push to GitHub
git add .
git commit -m "Ensure CSS files are present"
git push
```

Railway will auto-deploy in 2-5 minutes!

---

## 📞 WHAT TO DO NOW

1. **Visit your live site**
2. **Open browser console** (F12)
3. **Look for CSS errors**
4. **Try to access CSS directly:**
   - `https://YOUR-DOMAIN.com/css/main.css`
5. **Tell me what you see:**
   - Do you see CSS code? (good!)
   - Do you see 404 error? (files missing)
   - Do you see console errors? (path issues)

This will help me diagnose the exact issue!

---

## 🎯 MOST LIKELY SOLUTION

Based on common issues, the problem is probably:

**CSS files weren't pushed to GitHub!**

**Fix:**
1. Check locally: `dir public\css`
2. If missing, I'll recreate them
3. Push to GitHub: `git add . && git commit -m "Add CSS" && git push`
4. Wait 2-5 minutes for Railway to deploy
5. Hard refresh: `Ctrl + Shift + R`

Let me know what you find! 🔍
