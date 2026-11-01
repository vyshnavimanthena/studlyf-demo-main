param(
    [string]$OutputDir = "$PSScriptRoot\..\backups"
)

# Database backup script for Studlyf (Windows/PowerShell)
# Requires: mongodump (MongoDB Database Tools) in PATH

$ErrorActionPreference = "Stop"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupPath = Join-Path $OutputDir "studlyf_$Timestamp"

New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Starting backup..."

# Load .env
$EnvFile = "$PSScriptRoot\..\.env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)=(.*)") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "Env:$key" -Value $value -ErrorAction SilentlyContinue
        }
    }
}

$MongoUrl = $env:MONGO_URL
if (-not $MongoUrl) {
    Write-Error "MONGO_URL not set"
    exit 1
}

# Run mongodump
& mongodump --uri="$MongoUrl" --out="$BackupPath" --gzip --numParallelCollections=4
if (-not $?) {
    Write-Error "mongodump failed"
    exit 1
}

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Backup complete: $BackupPath"

# Compress
$CompressedPath = "$BackupPath.tar.gz"
& tar -czf $CompressedPath -C $OutputDir "studlyf_$Timestamp"
Remove-Item -Recurse -Force $BackupPath

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Compressed: $CompressedPath"

# Keep last 7 days
$Cutoff = (Get-Date).AddDays(-7)
Get-ChildItem $OutputDir -Filter "studlyf_*.tar.gz" | Where-Object {
    $_.CreationTime -lt $Cutoff
} | Remove-Item -Force

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Old backups cleaned (retention: 7 days)"
Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Done"
