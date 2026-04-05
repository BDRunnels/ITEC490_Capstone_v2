@echo off
setlocal

:: ============================================================
::  Self‑elevate to Administrator if not already elevated
:: ============================================================
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: ============================================================
::  SIEM Agent SYSTEM Installer
:: ============================================================
set SCRIPT_DIR=%~dp0
set AGENT_PS=%SCRIPT_DIR%siem-agent.ps1

if not exist "%AGENT_PS%" (
    echo ERROR: siem-agent.ps1 not found in %SCRIPT_DIR%
    pause
    exit /b 1
)

echo Installing SIEM Agent as SYSTEM scheduled task...

:: Delete old task if it exists
schtasks /Delete /TN "SIEMAgent" /F >nul 2>&1

:: Create SYSTEM-level scheduled task
schtasks /Create ^
    /TN "SIEMAgent" ^
    /SC ONSTART ^
    /RU "SYSTEM" ^
    /RL HIGHEST ^
    /TR "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File \"%AGENT_PS%\"" ^
    /F

if %ERRORLEVEL% NEQ 0 (
    echo Failed to create scheduled task.
    pause
    exit /b 1
)

echo Starting SIEM Agent...
schtasks /Run /TN "SIEMAgent"

echo.
echo SIEM Agent installed and running as SYSTEM.
echo It will start automatically on every boot.
echo.

exit /b 0