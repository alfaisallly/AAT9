# AstroLab v1.0.0-trial — Windows PowerShell launcher
$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent

Write-Host ""
Write-Host "  AstroLab v1.0.0-trial — USB Edition" -ForegroundColor Yellow
Write-Host "  Eng. Ahmed alfaisal" -ForegroundColor DarkYellow
Write-Host ""

Set-Location $Root

Start-Process cmd -ArgumentList "/k cd /d `"$Root\desktop-bridge`" && npm start" -WindowStyle Normal
Start-Sleep -Seconds 4
Start-Process "http://localhost:3000/login"
Set-Location $Root
npm run dev
