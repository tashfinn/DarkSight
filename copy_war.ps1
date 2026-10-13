$sourceDir = "C:\Users\mwtsf\AppData\Local\Google\Chrome\User Data\Default\Extensions\ddkjiahejlhfcafbddmgiahcphecmpfh\2026.1012.1545_0\web_accessible_resources"
$targetDir = "d:\Work\PROJECTS\CSE400 [CAPSTONE]\DarkSight\web_accessible_resources"

if (Test-Path $sourceDir) {
    Copy-Item -Path $sourceDir -Destination $targetDir -Recurse -Force
    Write-Host "Copied web_accessible_resources successfully."
}
