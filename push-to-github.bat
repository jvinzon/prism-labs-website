@echo off
color 0B
echo ========================================
echo PRISM Labs - Push to GitHub
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Git found!
echo.

REM Check if already a git repo
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo.
)

REM Add all files
echo Adding all files...
git add .
echo.

REM Commit
echo Enter commit message (or press Enter for default):
set /p COMMIT_MSG="["
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Update: PRISM Labs website

git commit -m "%COMMIT_MSG%"
echo.

REM Check if remote exists
git remote -v | findstr "origin" >nul
if %errorlevel% equ 0 (
    echo Remote 'origin' already exists
    echo.
    set /p UPDATE_REMOTE="Update remote URL? (y/n): "
    if /i "%UPDATE_REMOTE%"=="y" (
        set /p REPO_URL="Enter GitHub repository URL: "
        git remote set-url origin %REPO_URL%
    )
) else (
    echo Remote 'origin' not found
    set /p REPO_URL="Enter GitHub repository URL: "
    git remote add origin %REPO_URL%
)
echo.

REM Rename branch
git branch -M main

REM Push
echo Pushing to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo Push failed! Possible reasons:
    echo - Authentication failed (use Personal Access Token)
    echo - Repository doesn't exist on GitHub
    echo - Network error
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Next steps:
echo 1. Go to your repository on GitHub
echo 2. Verify all files are there
echo 3. Deploy to Railway/Render for full app
echo    OR
echo 4. Enable GitHub Pages for static site only
echo.
pause
