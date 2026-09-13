# Push Project EDITH to GitHub
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      Pushing Project EDITH to GitHub" -ForegroundColor Yellow
Write-Host "      Repo: https://github.com/iamshavu-cloud/project-edith.git" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$token = $env:GITHUB_TOKEN
if (-not $token) {
    $token = Read-Host "Enter your GitHub Token"
}

$repoUrl = "https://iamshavu-cloud:${token}@github.com/iamshavu-cloud/project-edith.git"

if (-not (Test-Path ".git")) {
    Write-Host "[*] Initializing git..." -ForegroundColor Yellow
    git init
    git branch -M main
}

git remote remove origin 2>$null
Write-Host "[*] Adding authenticated remote..." -ForegroundColor Yellow
git remote add origin $repoUrl

Write-Host "[*] Staging all project files..." -ForegroundColor Yellow
git add .

Write-Host "[*] Committing..." -ForegroundColor Yellow
git commit -m "feat: complete Project EDITH full-stack college AI senior platform"

Write-Host "[*] Pushing to GitHub main branch..." -ForegroundColor Green
git push -u origin main --force

# Reset remote URL to not expose credentials in git config
git remote set-url origin https://github.com/iamshavu-cloud/project-edith.git

Write-Host "`n[✓] Push complete! Visit: https://github.com/iamshavu-cloud/project-edith" -ForegroundColor Green
