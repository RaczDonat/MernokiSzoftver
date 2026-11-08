@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 goto noNode
where npm >nul 2>&1
if errorlevel 1 goto noNode

if not exist "node_modules\vite\bin\vite.js" (
  echo Frontend csomagok telepitese. Ez elso alkalommal par percet igenybe vehet...
  call npm install
  if errorlevel 1 goto installFailed
)

set "VITE_API_MODE=server"
set "VOYARA_API_URL=http://127.0.0.1:8000"
echo Voyara frontend indul: http://localhost:8080 (leallitas: Ctrl+C).
call npm run dev -- --host 0.0.0.0 --port 8080
if errorlevel 1 goto frontendFailed
exit /b 0

:noNode
echo HIBA: Telepitsd a Node.js LTS verziot az npm-mel egyutt, majd inditsd ujra ezt a fajlt.
pause
exit /b 1

:installFailed
echo HIBA: Nem sikerult telepiteni a frontend csomagokat. Ellenorizd az internetkapcsolatot.
pause
exit /b 1

:frontendFailed
echo HIBA: A frontend hibaba futott. Nezd meg a fenti uzeneteket.
pause
exit /b 1
