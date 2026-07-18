# Build and deploy SUNAT SOL web app to GitHub Pages
Write-Host "Building web export..." -ForegroundColor Cyan
npx expo export --platform web

Write-Host "Fixing paths to relative..." -ForegroundColor Cyan
$html = "dist/index.html"
(Get-Content $html) -replace 'href="/_expo', 'href="./_expo' -replace 'href="/favicon', 'href="./favicon' -replace 'src="/_expo', 'src="./_expo' | Set-Content $html

Write-Host "Adding phone frame CSS..." -ForegroundColor Cyan
# Phone frame already added if script runs after build; re-add if overwritten
$content = Get-Content $html -Raw
if ($content -notmatch "phone-frame") {
  Write-Host "Phone frame not found, needs manual addition" -ForegroundColor Yellow
}

Write-Host "Creating .nojekyll file..." -ForegroundColor Cyan
New-Item -ItemType File -Path "dist/.nojekyll" -Force | Out-Null

Write-Host "Deploying to gh-pages..." -ForegroundColor Cyan
npx gh-pages --dist dist --branch gh-pages --dotfiles --message "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

Write-Host "Done! https://brian-rivera-404.github.io/sunat-sol-mobile-/" -ForegroundColor Green
