# PRISM Labs - Push to GitHub (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRISM Labs - Push to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Git
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git not installed!" -ForegroundColor Red
    Write-Host "Install from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Initialize if needed
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git initialized!" -ForegroundColor Green
} else {
    Write-Host "Git repository already initialized" -ForegroundColor Green
}

Write-Host ""

# Add files
Write-Host "Adding all files..." -ForegroundColor Yellow
git add .
Write-Host "Files staged!" -ForegroundColor Green

Write-Host ""

# Commit
$commitMsg = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update: PRISM Labs website"
}

Write-Host "Committing: $commitMsg" -ForegroundColor Yellow
git commit -m $commitMsg

Write-Host ""

# Check remote
$remoteExists = git remote -v | Select-String "origin"
if ($remoteExists) {
    Write-Host "Remote 'origin' exists" -ForegroundColor Green
    $update = Read-Host "Update remote URL? (y/n)"
    if ($update -eq "y") {
        $repoUrl = Read-Host "Enter GitHub repository URL"
        git remote set-url origin $repoUrl
    }
} else {
    Write-Host "Remote 'origin' not found" -ForegroundColor Yellow
    $repoUrl = Read-Host "Enter GitHub repository URL (e.g., https://github.com/jvinzon/prism-labs-website.git)"
    git remote add origin $repoUrl
}

Write-Host ""

# Rename branch
Write-Host "Renaming branch to main..." -ForegroundColor Yellow
git branch -M main

# Push
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Code pushed to GitHub" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to your repository on GitHub" -ForegroundColor White
    Write-Host "2. Verify all files are uploaded" -ForegroundColor White
    Write-Host "3. Deploy to Railway.app or Render.com" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Push failed!" -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Authentication failed (use Personal Access Token)" -ForegroundColor White
    Write-Host "- Repository doesn't exist on GitHub" -ForegroundColor White
    Write-Host "- Network error" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"
