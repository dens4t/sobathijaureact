@echo off
cd /d "%~dp0"
echo ========================================
echo  Sobat Hijau - DLH Kota Pontianak
echo  Production Server
echo ========================================
echo.
echo Running on: http://localhost:3001
echo.
set PORT=3001
npx tsx server.ts
pause
