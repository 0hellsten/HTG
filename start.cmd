@echo off
title Stallbacken
echo ===================================================
echo   Startar Stallbacken...
echo ===================================================
echo.
cd /d "%~dp0"

REM Kontrollera om dependencies finns
if not exist "node_modules" (
  echo Forbereder forsta korningen...
  call pnpm install
)

start "" http://localhost:5173
call pnpm dev
pause
