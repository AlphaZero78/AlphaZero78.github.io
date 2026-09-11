$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$stateFile = Join-Path $projectRoot 'output\server.json'
if (-not (Test-Path -LiteralPath $stateFile)) { Write-Host 'No preview started by this launcher was found.'; exit 0 }
$serverState = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
$serverPid = [int]$serverState.pid
$expectedVite = Join-Path $projectRoot 'node_modules\vite\bin\vite.js'
$running = Get-CimInstance Win32_Process -Filter "ProcessId = $serverPid" -ErrorAction SilentlyContinue
if ($running) {
    if (-not $running.CommandLine -or $running.CommandLine.IndexOf($expectedVite, [System.StringComparison]::OrdinalIgnoreCase) -lt 0) {
        throw 'The stored process ID belongs to another process; it was left running.'
    }
    Stop-Process -Id $serverPid
    Write-Host "Stopped the personal archive preview (PID $serverPid)."
} else { Write-Host 'The preview has already stopped.' }
Remove-Item -LiteralPath $stateFile
