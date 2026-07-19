@echo off
chcp 65001 >nul
title AstroLab v1.0.0-trial — Eng. Ahmed alfaisal
color 0E

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║   AstroLab v1.0.0-trial — Windows USB Edition      ║
echo  ║   Eng. Ahmed alfaisal                                ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0.."

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js غير مثبت. حمّله من https://nodejs.org
  pause
  exit /b 1
)

echo [1/3] Starting USB Bridge on port 18881...
start "AstroLab USB Bridge" cmd /k "cd /d %~dp0..\desktop-bridge && npm start"

echo [2/3] Waiting for bridge...
timeout /t 4 /nobreak >nul

echo [3/3] Starting AstroLab app on http://localhost:3000 ...
start "" "http://localhost:3000/login"

cd /d "%~dp0.."
call npm run dev

pause
