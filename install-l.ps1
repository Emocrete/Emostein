$ErrorActionPreference = "Stop"

$markerStart = "# >>> EmoLive l command >>>"
$markerEnd = "# <<< EmoLive l command <<<"
$profilePath = $PROFILE.CurrentUserCurrentHost
$profileDir = Split-Path -Parent $profilePath
if (-not (Test-Path $profileDir)) { New-Item -ItemType Directory -Path $profileDir -Force | Out-Null }
if (-not (Test-Path $profilePath)) { New-Item -ItemType File -Path $profilePath -Force | Out-Null }

$current = Get-Content -Raw -Path $profilePath
$block = @"
$markerStart
function l {
    `$repoRoot = git rev-parse --show-toplevel 2>`$null
    if ([string]::IsNullOrWhiteSpace(`$repoRoot)) {
        Write-Host "Not inside a Git repository." -ForegroundColor Red
        return
    }
    `$scriptPath = Join-Path `$repoRoot "l.ps1"
    if (-not (Test-Path `$scriptPath)) {
        Write-Host "l.ps1 not found in repo root." -ForegroundColor Red
        return
    }
    & `$scriptPath
}
$markerEnd
"@

if ($current.Contains($markerStart)) {
    $pattern = [regex]::Escape($markerStart) + "[\s\S]*?" + [regex]::Escape($markerEnd)
    $current = [regex]::Replace($current, $pattern, $block)
} else {
    $current = $current.TrimEnd() + "`r`n`r`n" + $block + "`r`n"
}

Set-Content -Path $profilePath -Value $current -Encoding UTF8
. $profilePath
Write-Host "Installed. Use: l" -ForegroundColor Green
