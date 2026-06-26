$ErrorActionPreference = "Stop"

$root = git rev-parse --show-toplevel
if ([string]::IsNullOrWhiteSpace($root)) { throw "Not inside a Git repository." }
Set-Location $root

$commitMessage = "Live " + (Get-Date -Format "yyMMdd HHmm")

git add .

$hasChanges = git status --porcelain
if ([string]::IsNullOrWhiteSpace($hasChanges)) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    exit 0
}

git commit -m $commitMessage
git push
