$sourceDir = "C:\Users\mwtsf\AppData\Local\Google\Chrome\User Data\Default\Extensions\ddkjiahejlhfcafbddmgiahcphecmpfh\2026.1012.1545_0\rulesets\main"
$targetDir = "d:\Work\PROJECTS\CSE400 [CAPSTONE]\DarkSight\rulesets"

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

$ruleFiles = @(
    "ublock-filters.json",
    "easylist.json",
    "easyprivacy.json",
    "pgl.json",
    "ublock-badware.json",
    "urlhaus-full.json"
)

foreach ($f in $ruleFiles) {
    $srcFile = Join-Path $sourceDir $f
    if (Test-Path $srcFile) {
        Copy-Item -Path $srcFile -Destination (Join-Path $targetDir $f) -Force
        Write-Host "Copied $f successfully."
    } else {
        Write-Warning "File not found: $srcFile"
    }
}
