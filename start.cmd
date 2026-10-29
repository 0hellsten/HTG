@echo off
title HTG - Hellstens Trav och Galopp
echo ===================================================
echo   Startar HTG (Hellstens Trav och Galopp)...
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
