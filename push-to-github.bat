@echo off
title Push Project EDITH to GitHub
echo ========================================================
echo       Pushing Project EDITH to GitHub
echo       Repo: https://github.com/iamshavu-cloud/project-edith
echo ========================================================
echo.

if "%GITHUB_TOKEN%"=="" (
    set /p "GITHUB_TOKEN=Enter your GitHub Token: "
)

set "REPO_URL=https://iamshavu-cloud:%GITHUB_TOKEN%@github.com/iamshavu-cloud/project-edith.git"

if not exist ".git\" (
    echo [*] Initializing git repository...
    git init
    git branch -M main
)

echo [*] Configuring git remote...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo [*] Staging all files...
git add .

echo [*] Committing files...
git commit -m "feat: complete Project EDITH full-stack college AI senior platform"

echo [*] Pushing to main branch...
git push -u origin main --force

git remote set-url origin https://github.com/iamshavu-cloud/project-edith.git

echo.
echo ========================================================
echo       Done! Check https://github.com/iamshavu-cloud/project-edith
echo ========================================================
pause
