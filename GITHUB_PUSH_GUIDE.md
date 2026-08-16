# PRISM Labs Website - Push to GitHub Guide

## OVERVIEW

You have a complete PRISM Labs website ready to push to GitHub. This guide will help you:
1. Initialize Git (if not already done)
2. Create a GitHub repository
3. Push your code
4. Deploy to GitHub Pages (optional)

---

## METHOD 1: Using Git Bash (Recommended)

### Step 1: Open Git Bash in Project Folder

1. Open File Explorer
2. Navigate to: `C:\Users\jedidiah\prism-labs-website`
3. Right-click in an empty space
4. Click **"Open Git Bash here"** or **"Git Bash Here"**

If you don't see this option, you need to install Git:
- Download from: https://git-scm.com/download/win
- Install with default settings
- Restart and try again

### Step 2: Check Git Status

In Git Bash, type:
```bash
git status
```

**If you see "Not a git repository":**
```bash
git init
git add .
git commit -m "Initial commit: PRISM Labs website v2.0"
```

**If you see files listed:**
```bash
git add .
git commit -m "Initial commit: PRISM Labs website v2.0"
```

### Step 3: Create GitHub Repository

1. Go to https://github.com
2. Sign in to your account (jvinzon)
3. Click the **+** icon (top right) → **New repository**
4. Fill in:
   - **Repository name:** `prism-labs-website`
   - **Description:** "PRISM Labs - Technology club at ASDAH. Where curiosity becomes capability."
   - **Visibility:** Public (recommended for clubs) or Private
   - **DO NOT** check "Initialize with README" (we already have one)
5. Click **Create repository**

### Step 4: Connect Local Repo to GitHub

GitHub will show you commands like this:
```bash
git remote add origin https://github.com/jvinzon/prism-labs-website.git
git branch -M main
git push -u origin main
```

**Run these commands in Git Bash:**

```bash
# Add GitHub remote (replace with your actual repo URL)
git remote add origin https://github.com/jvinzon/prism-labs-website.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**If you get an error about remote already existing:**
```bash
git remote set-url origin https://github.com/jvinzon/prism-labs-website.git
git push -u origin main
```

### Step 5: Verify Push

1. Go to your repository: https://github.com/jvinzon/prism-labs-website
2. Refresh the page
3. You should see all your files:
   - package.json
   - server.js
   - routes/
   - views/
   - public/
   - scripts/
   - README.md
   - etc.

---

## METHOD 2: Using GitHub Desktop (Easiest for Beginners)

### Step 1: Install GitHub Desktop

1. Download from: https://desktop.github.com/
2. Install and run
3. Sign in with your GitHub account

### Step 2: Add Project to GitHub Desktop

1. Open GitHub Desktop
2. Click **File** → **Add Local Repository**
3. Click **Choose...**
4. Navigate to: `C:\Users\jedidiah\prism-labs-website`
5. Click **Select Folder**

If it says "not a git repository":
- Click **Create a repository**
- Name: `prism-labs-website`
- Description: "PRISM Labs website"
- Click **Create repository**

### Step 3: Commit Changes

1. GitHub Desktop will show all your files in "Changes" tab
2. In the "Summary" box (bottom left), type: `Initial commit: PRISM Labs website v2.0`
3. Click **Commit to main** (or **Commit to master**)

### Step 4: Publish to GitHub

1. Click **Publish repository** (top right)
2. Name: `prism-labs-website`
3. Description: "PRISM Labs - Technology club at ASDAH"
4. Uncheck "Keep this code private" (unless you want it private)
5. Click **Publish repository**

Done! Your code is now on GitHub.

---

## METHOD 3: Using Command Prompt (If Git Bash Not Available)

### Step 1: Open Command Prompt in Project Folder

1. Open File Explorer
2. Navigate to: `C:\Users\jedidiah\prism-labs-website`
3. Click in the address bar
4. Type `cmd` and press Enter

### Step 2: Initialize Git (if needed)

```cmd
git init
git add .
git commit -m "Initial commit: PRISM Labs website v2.0"
```

### Step 3: Add Remote and Push

```cmd
git remote add origin https://github.com/jvinzon/prism-labs-website.git
git branch -M main
git push -u origin main
```

---

## AFTER PUSHING TO GITHUB

### Option A: Deploy to GitHub Pages (Static Only)

**Note:** GitHub Pages only hosts static files (HTML, CSS, JS). Since PRISM Labs uses Node.js backend, you have two options:

#### Option A1: Static Frontend Only
1. Go to your repo on GitHub
2. Click **Settings** → **Pages**
3. Source: Deploy from a branch
4. Branch: `main`, Folder: `/ (root)`
5. Click **Save**
6. Wait 2-3 minutes
7. Your site will be at: `https://jvinzon.github.io/prism-labs-website/`

**Limitation:** Only static pages will work (homepage, about). Backend features won't work.

#### Option A2: Full App Deployment (Recommended)
Use a Node.js hosting platform instead:

**Railway.app** (Easiest):
1. Go to https://railway.app
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select `prism-labs-website`
5. Add environment variables from your `.env` file
6. Click **Deploy**
7. Get your live URL!

**Render.com** (Free tier):
1. Go to https://render.com
2. Sign up with GitHub
3. Click **New** → **Web Service**
4. Connect your repository
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables
8. Click **Create Web Service**

**Heroku** (Student plan):
1. Install Heroku CLI
2. Run: `heroku login`
3. Run: `heroku create prism-labs-website`
4. Run: `git push heroku main`
5. Add config vars in Heroku dashboard

---

## MAKING UPDATES LATER

After making changes to your code:

### In Git Bash or Command Prompt:
```bash
cd C:\Users\jedidiah\prism-labs-website

# Check what changed
git status

# Stage all changes
git add .

# Commit with message
git commit -m "Added member dashboard and resource library"

# Push to GitHub
git push
```

### In GitHub Desktop:
1. Open GitHub Desktop
2. See your changes in "Changes" tab
3. Write a summary (e.g., "Added member dashboard")
4. Click **Commit to main**
5. Click **Push origin** (top right)

---

## TROUBLESHOOTING

### "fatal: remote origin already exists"
```bash
git remote set-url origin https://github.com/jvinzon/prism-labs-website.git
git push -u origin main
```

### "fatal: Authentication failed"
- Make sure you're logged into GitHub
- Use a Personal Access Token instead of password:
  1. Go to GitHub → Settings → Developer settings → Personal access tokens
  2. Generate new token (classic) with `repo` scope
  3. Use this token as your password when pushing

### "fatal: repository not found"
- Double-check the repository URL
- Make sure the repository exists on GitHub
- Check your spelling: `https://github.com/jvinzon/prism-labs-website.git`

### "Everything up-to-date" but files not on GitHub
- Make sure you committed: `git commit -m "message"`
- Check which branch: `git branch`
- Push the correct branch: `git push origin main`

### Large file errors
Add to `.gitignore`:
```
node_modules/
data/*.db
.env
```

Then:
```bash
git rm --cached node_modules -r
git commit -m "Remove node_modules from git"
git push
```

---

## RECOMMENDED .gitignore

Make sure your `.gitignore` includes:

```
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.production

# Database
data/*.db
data/*.db-journal
data/*.db-shm
data/*.db-wal

# Uploads
uploads/*
!uploads/.gitkeep

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

---

## QUICK REFERENCE COMMANDS

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Your message here"

# Add remote
git remote add origin https://github.com/jvinzon/prism-labs-website.git

# Push
git push -u origin main

# Check status
git status

# View remote
git remote -v

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout branch-name
```

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Set up hosting** (Railway, Render, or school server)
2. **Configure environment variables** on hosting platform
3. **Test the live site**
4. **Set up CI/CD** (automatic deployment on push)
5. **Add custom domain** (optional)

---

**Need Help?**
- Check GitHub Docs: https://docs.github.com/
- Git reference: https://git-scm.com/doc
- Contact: fine@asdah.school.nz
