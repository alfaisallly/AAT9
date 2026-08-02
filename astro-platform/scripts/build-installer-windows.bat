@echo off
chcp 65001 >nul
title AstroLab — Build Windows Installer
color 0E

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║  AstroLab v1.0.0-trial — Build NSIS Installer        ║
echo  ║  Eng. Ahmed alfaisal                                 ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0.."

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js required — https://nodejs.org
  pause
  exit /b 1
)

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 exit /b 1

echo [2/5] Building Next.js app...
call npm run build
if errorlevel 1 exit /b 1

echo [3/5] Building x64 installer...
set TARGET_ARCH=x64
call npm run prepare:standalone
if errorlevel 1 exit /b 1
call npx electron-builder --win nsis --x64
if errorlevel 1 exit /b 1

echo [4/5] Building x86 (32-bit) installer...
set TARGET_ARCH=ia32
call npm run prepare:standalone
if errorlevel 1 exit /b 1
call npx electron-builder --win nsis --ia32
if errorlevel 1 exit /b 1

echo [5/5] Done!
echo.
echo  Installers in dist\
dir /b dist\*.exe 2>nul
echo.
echo  x64  = Windows 64-bit (most PCs)
echo  ia32 = Windows 32-bit
echo.
pause
