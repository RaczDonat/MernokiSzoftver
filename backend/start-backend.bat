@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Nem talalhato Python kornyezet. Letrehozas...
  where py >nul 2>&1
  if not errorlevel 1 (
    py -3 -m venv .venv
  ) else (
    where python >nul 2>&1
    if errorlevel 1 goto noPython
    python -m venv .venv
  )
)

if not exist ".venv\Scripts\python.exe" goto noPython

".venv\Scripts\python.exe" -m pip --version >nul 2>&1
if errorlevel 1 (
  echo Pip helyreallitasa a virtualis kornyezetben...
  ".venv\Scripts\python.exe" -m ensurepip --upgrade
  if errorlevel 1 goto pipFailed
)

".venv\Scripts\python.exe" -c "import fastapi, uvicorn, sqlalchemy, pydantic, email_validator; raise SystemExit(pydantic.__version__ != '2.13.5')" >nul 2>&1
if errorlevel 1 (
  echo Backend fuggosegek frissitese, Pydantic 2.13.5-tel es Uvicornnal...
  ".venv\Scripts\python.exe" -m pip install --disable-pip-version-check -r requirements.txt "uvicorn[standard]==0.34.0"
  if errorlevel 1 goto installFailed
)

echo Voyara API indul: http://127.0.0.1:8000 (leallitas: Ctrl+C).
".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
if errorlevel 1 goto backendFailed
exit /b 0

:noPython
echo HIBA: Telepitsd a Python 3-at, es engedelyezd a Python Launchert vagy az Add Python to PATH opciot.
pause
exit /b 1

:pipFailed
echo HIBA: Nem sikerult elokesziteni a pipet a virtualis kornyezetben.
pause
exit /b 1

:installFailed
echo HIBA: Nem sikerult telepiteni a backend fuggosegeit. Ellenorizd az internetkapcsolatot.
pause
exit /b 1

:backendFailed
echo HIBA: A backend hibaba futott. Nezd meg a fenti uzeneteket.
pause
exit /b 1
