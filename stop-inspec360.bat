@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  INSPEC360 v2.2 - Parar o Sistema
REM ═══════════════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   INSPEC360 v2.2 - Parando Sistema                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/2] Encerrando Backend...
taskkill /FI "WINDOWTITLE eq INSPEC360 Backend*" /T /F >nul 2>&1
if errorlevel 0 (
    echo ✅ Backend encerrado
) else (
    echo ⚠️  Backend não estava rodando
)

echo.
echo [2/2] Encerrando Frontend...
taskkill /FI "WINDOWTITLE eq INSPEC360 Frontend*" /T /F >nul 2>&1
if errorlevel 0 (
    echo ✅ Frontend encerrado
) else (
    echo ⚠️  Frontend não estava rodando
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   ✅ INSPEC360 PARADO                                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause
