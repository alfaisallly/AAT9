@echo off
chcp 65001 >nul
title AstroLab Trial Installer v1.0.0
color 0B

echo.
echo  AstroLab v1.0.0-trial — Installation
echo  Eng. Ahmed alfaisal
echo.

cd /d "%~dp0.."

where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js 18+ from https://nodejs.org
  pause
  exit /b 1
)

echo Installing main app...
call npm install
if errorlevel 1 exit /b 1

echo Installing USB Bridge...
cd desktop-bridge
call npm install
if errorlevel 1 exit /b 1
cd ..

echo.
echo  Done! Run: scripts\start-trial-windows.bat
echo  Connect USB cameras/mounts then open Equipment - USB
echo.
pause
