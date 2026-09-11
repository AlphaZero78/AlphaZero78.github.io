param([switch]$NoBrowser, [switch]$SkipBuild, [int]$Port = 18782)
$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$siteUrl = "http://127.0.0.1:$Port/"
$siteId = 'alphazero78-homepage-rhine-lab'
Set-Location -LiteralPath $projectRoot

try {
    $existing = Invoke-RestMethod -Uri ($siteUrl + 'site-id.json') -TimeoutSec 2
    if ($existing.id -eq $siteId) {
        Write-Host "Already running: $siteUrl"
        if (-not $NoBrowser) { Start-Process ($siteUrl + 'preview.html') }
        exit 0
    }
} catch { }
if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    throw "Port $Port is in use by another application. Use -Port with a different port."
}
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $nodeCommand) { throw 'Install Node.js 22.12 or newer from https://nodejs.org/ and run this launcher again.' }
$nodeVersion = [version]((& $nodeCommand.Source -p 'process.versions.node').Trim())
if ($nodeVersion -lt [version]'22.12.0') { throw 'Node.js 22.12 or newer is required.' }
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'node_modules\vite\bin\vite.js'))) {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
}
if (-not $SkipBuild -or -not (Test-Path -LiteralPath (Join-Path $projectRoot 'dist\index.html'))) {
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Production build failed.' }
}
$outputDir = Join-Path $projectRoot 'output'
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
$vitePath = Join-Path $projectRoot 'node_modules\vite\bin\vite.js'
$serverProcess = Start-Process -FilePath $nodeCommand.Source -ArgumentList @(('"' + $vitePath + '"'), 'preview', '--host', '127.0.0.1', '--port', $Port, '--strictPort') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $outputDir 'server.log') -RedirectStandardError (Join-Path $outputDir 'server-error.log')
@{ pid = $serverProcess.Id; port = $Port; root = $projectRoot } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $outputDir 'server.json') -Encoding utf8
$ready = $false
for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 250
    try {
        $status = Invoke-RestMethod -Uri ($siteUrl + 'site-id.json') -TimeoutSec 1
        if ($status.id -eq $siteId) { $ready = $true; break }
    } catch { }
    $serverProcess.Refresh()
    if ($serverProcess.HasExited) { break }
}
if (-not $ready) { throw 'The preview server did not start. Check output/server-error.log.' }
Write-Host "Personal archive: $siteUrl"
Write-Host "Reading page: ${siteUrl}profile.html"
Write-Host 'Use the stop launcher to stop this preview.'
if (-not $NoBrowser) { Start-Process ($siteUrl + 'preview.html') }
