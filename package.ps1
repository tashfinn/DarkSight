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
    "yt_defuser.js",
    "adblocker.js",
    "adblock.css",
    "popup.html",
    "popup.css",
    "popup.js",
    "auth.html",
    "auth.js",
    "styles.css",
    "rules.json",
    "adblock_rules.json"
)

foreach ($file in $coreFiles) {
    $src = Join-Path $scriptRoot $file
    if (Test-Path -LiteralPath $src) {
        Copy-Item -LiteralPath $src -Destination (Join-Path $stageDir $file) -Force
    } else {
        Write-Warning "Missing file: $file"
    }
}

# Icon assets (only production extension icons)
$logoDir = Join-Path $scriptRoot "logo"
Get-ChildItem -LiteralPath $logoDir | Where-Object { $_.Name -match "^icon(16|48|128)\.png$" } | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $stageDir "logo\$($_.Name)") -Force
}

# Copy lib folder (local Puter.js)
$libDir = Join-Path $scriptRoot "lib"
if (Test-Path -LiteralPath $libDir) {
    Copy-Item -LiteralPath $libDir -Destination (Join-Path $stageDir "lib") -Recurse -Force
}

# Copy rulesets and web_accessible_resources
$rulesetsDir = Join-Path $scriptRoot "rulesets"
if (Test-Path -LiteralPath $rulesetsDir) {
    Copy-Item -LiteralPath $rulesetsDir -Destination (Join-Path $stageDir "rulesets") -Recurse -Force
}

$warDir = Join-Path $scriptRoot "web_accessible_resources"
if (Test-Path -LiteralPath $warDir) {
    Copy-Item -LiteralPath $warDir -Destination (Join-Path $stageDir "web_accessible_resources") -Recurse -Force
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
