# Build and deploy SUNAT SOL web app to GitHub Pages
Write-Host "Building web export..." -ForegroundColor Cyan
npx expo export --platform web

Write-Host "Patching index.html (relative paths & phone frame)..." -ForegroundColor Cyan
node scripts/patch-html.js

Write-Host "Creating .nojekyll file..." -ForegroundColor Cyan
New-Item -ItemType File -Path "dist/.nojekyll" -Force | Out-Null

Write-Host "Syncing build to docs/ folder for GitHub Pages..." -ForegroundColor Cyan
if (Test-Path "docs") {
    Remove-Item -Path "docs" -Recurse -Force
}
New-Item -ItemType Directory -Path "docs" -Force | Out-Null
Copy-Item -Path "dist\*" -Destination "docs" -Recurse -Force

Write-Host "Deploying to gh-pages branch..." -ForegroundColor Cyan
npx gh-pages --dist dist --branch gh-pages --dotfiles --message "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

Write-Host "Staging docs changes..." -ForegroundColor Cyan
git add docs

Write-Host "Done! Remember to commit and push 'docs/' directory to 'main' branch if you deploy from main/docs." -ForegroundColor Green
Write-Host "URL: https://brian-rivera-404.github.io/sunat-sol-mobile-/" -ForegroundColor Green
