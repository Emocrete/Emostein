$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel 2>$null
if ([string]::IsNullOrWhiteSpace($repoRoot)) {
    Write-Host "Not inside a Git repository." -ForegroundColor Red
    exit 1
}

Set-Location $repoRoot
$commitMessage = "Live " + (Get-Date -Format "yyMMdd HHmm")

Write-Host "git add ." -ForegroundColor Cyan
git add .

$hasChanges = git status --porcelain
if ([string]::IsNullOrWhiteSpace($hasChanges)) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    exit 0
}

Write-Host "git commit -m '$commitMessage'" -ForegroundColor Cyan
git commit -m $commitMessage

Write-Host "git push" -ForegroundColor Cyan
git push

Write-Host "Done: $commitMessage" -ForegroundColor Green
