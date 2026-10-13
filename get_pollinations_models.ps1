try {
    $models = Invoke-RestMethod -Uri "https://text.pollinations.ai/models" -Method Get
    Write-Host "Available models:"
    $models | ConvertTo-Json -Depth 3 | Write-Host
} catch {
    Write-Host "Error fetching models: $($_.Exception.Message)"
}
