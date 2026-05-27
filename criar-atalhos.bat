@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  Criar Atalhos no Desktop - INSPEC360 v2.2
REM ═══════════════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Criando Atalhos no Desktop                              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Obter caminho da pasta atual
for /f "delims=" %%A in ('cd') do set "CURRENT_DIR=%%A"

REM Obter caminho do Desktop
for /f "tokens=3*" %%A in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Desktop') do set "DESKTOP=%%B"

echo [1/2] Criando atalho de INICIAR...

REM Criar atalho para iniciar
powershell -Command ^
  "$WshShell = New-Object -ComObject WScript.Shell; " ^
  "$Shortcut = $WshShell.CreateShortcut('%DESKTOP%\🚀 Iniciar INSPEC360.lnk'); " ^
  "$Shortcut.TargetPath = '%CURRENT_DIR%\start-inspec360.vbs'; " ^
  "$Shortcut.WorkingDirectory = '%CURRENT_DIR%'; " ^
  "$Shortcut.Description = 'INSPEC360 v2.2 - Sistema de Inspeção'; " ^
  "$Shortcut.Save()"

if errorlevel 0 (
    echo ✅ Atalho criado: 🚀 Iniciar INSPEC360.lnk
) else (
    echo ❌ Erro ao criar atalho
)

echo.
echo [2/2] Criando atalho de PARAR...

REM Criar atalho para parar
powershell -Command ^
  "$WshShell = New-Object -ComObject WScript.Shell; " ^
  "$Shortcut = $WshShell.CreateShortcut('%DESKTOP%\⏹️ Parar INSPEC360.lnk'); " ^
  "$Shortcut.TargetPath = '%CURRENT_DIR%\stop-inspec360.vbs'; " ^
  "$Shortcut.WorkingDirectory = '%CURRENT_DIR%'; " ^
  "$Shortcut.Description = 'Parar INSPEC360 v2.2'; " ^
  "$Shortcut.Save()"

if errorlevel 0 (
    echo ✅ Atalho criado: ⏹️ Parar INSPEC360.lnk
) else (
    echo ❌ Erro ao criar atalho
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   ✅ Atalhos Criados no Desktop                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Você agora tem 2 atalhos no desktop:
echo   🚀 Iniciar INSPEC360
echo   ⏹️ Parar INSPEC360
echo.
echo Clique duplo em "🚀 Iniciar INSPEC360" para rodar o sistema!
echo.

pause
