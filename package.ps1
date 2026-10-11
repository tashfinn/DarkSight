# DarkSight Chrome Extension Packaging Script
# Generates a clean distribution ZIP for Chrome Web Store and GitHub Releases

Add-Type -AssemblyName System.IO.Compression.FileSystem

$scriptRoot = $PSScriptRoot
if (-not $scriptRoot) { $scriptRoot = "d:\Work\PROJECTS\CSE400 [CAPSTONE]\DarkSight" }

$manifestPath = Join-Path $scriptRoot "manifest.json"
if (-not (Test-Path -LiteralPath $manifestPath)) {
    Write-Error "manifest.json not found in $scriptRoot"
    exit 1
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
Write-Host "Packaging DarkSight Extension v$version..." -ForegroundColor Cyan

$distDir = Join-Path $scriptRoot "dist"
$stageDir = Join-Path $distDir "extension_bundle"

if (Test-Path -LiteralPath $distDir) {
    Remove-Item -LiteralPath $distDir -Recurse -Force
}
New-Item -ItemType Directory -Path $stageDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stageDir "logo") -Force | Out-Null

# Core Extension Files
$coreFiles = @(
    "manifest.json",
    "background.js",
    "content.js",
    "prompt.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "styles.css",
    "rules.json"
)

foreach ($file in $coreFiles) {
    $src = Join-Path $scriptRoot $file
    if (Test-Path -LiteralPath $src) {
        Copy-Item -LiteralPath $src -Destination (Join-Path $stageDir $file) -Force
    } else {
        Write-Warning "Missing file: $file"
    }
}

# Icon assets
$logoDir = Join-Path $scriptRoot "logo"
Get-ChildItem -LiteralPath $logoDir | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $stageDir "logo\$($_.Name)") -Force
}

$zipPath = Join-Path $distDir "darksight-v$version.zip"
[System.IO.Compression.ZipFile]::CreateFromDirectory($stageDir, $zipPath)

# Remove temporary staging directory, leaving only the clean ZIP
Remove-Item -LiteralPath $stageDir -Recurse -Force

$zipInfo = Get-Item -LiteralPath $zipPath
$zipSizeKb = [math]::Round($zipInfo.Length / 1KB, 2)

Write-Host "Success! Created bundle:" -ForegroundColor Green
Write-Host "  Path: $zipPath" -ForegroundColor White
Write-Host "  Size: $zipSizeKb KB" -ForegroundColor White
