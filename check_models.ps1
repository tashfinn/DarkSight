$res = Invoke-RestMethod -Uri 'https://api.puter.com/puterai/chat/models/details' -Method Get
$terms = @('gpt-4o-mini', 'claude-3-5-sonnet', 'deepseek', 'gemini-1.5-flash', 'mistral-large')
foreach ($term in $terms) {
    Write-Output "=== Search: $term ==="
    $found = $res.models | Where-Object { $_.id -like "*$term*" } | Select-Object -First 3
    $found | ForEach-Object { Write-Output "$($_.id) | $($_.provider) | $($_.name)" }
}
