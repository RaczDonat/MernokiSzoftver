@echo off
setlocal
title Voyara Indito
cd /d "%~dp0"

echo ==========================================
echo   Voyara backend es frontend inditasa
echo ==========================================
echo.

echo [1/3] FastAPI backend inditasa...
start "Voyara Backend - FastAPI" cmd /k ""%~dp0backend\start-backend.bat""
call :WaitForPort 8000
if errorlevel 1 goto backendTimeout

echo [2/3] React frontend inditasa...
start "Voyara Frontend - Vite" cmd /k ""%~dp0start-frontend.bat""
call :WaitForPort 8080
if errorlevel 1 goto frontendTimeout

echo [3/3] Ngrok HTTPS alagut inditasa...
start "Voyara Ngrok" cmd /k ""%~dp0start-ngrok.bat""

echo.
echo A Voyara helyben itt fut: http://localhost:8080
echo A publikus Ngrok URL az Ngrok ablakban jelenik meg.
echo Leallitas: zardd be a Backend, Frontend es Ngrok ablakokat.
pause
exit /b 0

:backendTimeout
echo HIBA: A backend 3 percen belul nem nyitotta meg a 8000-es portot.
echo Nezd meg a Backend ablakot telepitesi vagy inditasi hibaert.
pause
exit /b 1

:frontendTimeout
echo HIBA: A frontend 3 percen belul nem nyitotta meg a 8080-as portot.
echo Nezd meg a Frontend ablakot telepitesi vagy inditasi hibaert.
pause
exit /b 1

:WaitForPort
set "WAIT_PORT=%~1"
set "WAIT_ATTEMPTS=0"
:WaitForPortLoop
powershell -NoProfile -Command "$client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', %WAIT_PORT%); $client.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 exit /b 0
set /a WAIT_ATTEMPTS+=1 >nul
if %WAIT_ATTEMPTS% GEQ 90 exit /b 1
timeout /t 2 /nobreak >nul
goto WaitForPortLoop
