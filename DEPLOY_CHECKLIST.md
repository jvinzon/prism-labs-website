# 🚂 Railway Deployment - Quick Checklist

## BEFORE YOU START

- [ ] GitHub account created
- [ ] Railway.app account created (sign in with GitHub)
- [ ] Code ready to deploy

## STEP 1: PUSH TO GITHUB

```cmd
cd C:\Users\jedidiah\prism-labs-website
git init
git add .
git commit -m "Ready for Railway deployment"
git remote add origin https://github.com/YOUR_USERNAME/prism-labs-website.git
git push -u origin main
```

## STEP 2: DEPLOY TO RAILWAY

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select `prism-labs-website` repo
4. Click "Deploy Now"

## STEP 3: ADD ENVIRONMENT VARIABLES

In Railway dashboard → Variables tab:

- [ ] `NODE_ENV` = `production`
- [ ] `SESSION_SECRET` = (generate random string)
- [ ] `DATABASE_PATH` = `./data/prism-labs.db`

## STEP 4: ADD PERSISTENT VOLUME

1. Settings → Volumes → Add Volume
2. Mount path: `/app/data`
3. Size: 1GB (free tier)

## STEP 5: WAIT & TEST

- [ ] Wait for successful deployment (green checkmark)
- [ ] Generate domain (Settings → Domains)
- [ ] Visit your Railway URL
- [ ] Test homepage loads

## STEP 6: CREATE ADMIN

Run in Railway Shell:
```bash
node scripts/init-db-simple.js
```

## DONE! ✅

Your PRISM Labs site is live! 🎉

---

**Files created for deployment:**
- ✅ railway.json
- ✅ Procfile
- ✅ package.json (updated with scripts)
- ✅ RAILWAY_DEPLOYMENT.md (full guide)
- ✅ This checklist
