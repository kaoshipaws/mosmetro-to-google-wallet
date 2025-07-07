# Build script for Windows

Write-Host "Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "lib") { Remove-Item -Path "lib" -Recurse -Force }
if (Test-Path "dist") { Remove-Item -Path "dist" -Recurse -Force }

Write-Host "Building ESM version..." -ForegroundColor Green
npx tsc -p tsconfig.esm.json

Write-Host "Building CJS version..." -ForegroundColor Green  
npx tsc -p tsconfig.cjs.json

Write-Host "Creating package.json files..." -ForegroundColor Blue
New-Item -Path "lib/cjs" -Name "package.json" -ItemType "file" -Value '{"type": "commonjs"}' -Force | Out-Null
New-Item -Path "lib/esm" -Name "package.json" -ItemType "file" -Value '{"type": "module"}' -Force | Out-Null

Write-Host "Build completed successfully!" -ForegroundColor Green
