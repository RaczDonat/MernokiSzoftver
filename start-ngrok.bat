@echo off
setlocal
cd /d "%~dp0"

set "NGROK_COMMAND="
if exist "%~dp0ngrok.exe" set "NGROK_COMMAND=%~dp0ngrok.exe"
if not defined NGROK_COMMAND (
  where ngrok >nul 2>&1
  if not errorlevel 1 set "NGROK_COMMAND=ngrok"
)

if not defined NGROK_COMMAND goto noNgrok

echo HTTPS alagut nyitasa a Voyara frontendhez: http://localhost:8080
echo Az ngrokhoz egyszeri fioktoken kell. Beallitas: ngrok config add-authtoken SAJAT_TOKEN
"%NGROK_COMMAND%" http 8080
if errorlevel 1 goto ngrokFailed
exit /b 0

:noNgrok
echo HIBA: Az ngrok nem talalhato. Telepitsd es add a PATH-hoz, vagy tedd az ngrok.exe-t e fajl melle.
pause
exit /b 1

:ngrokFailed
echo HIBA: Az ngrok leallt. Ellenorizd a token beallitasat es a fenti uzeneteket.
pause
exit /b 1
