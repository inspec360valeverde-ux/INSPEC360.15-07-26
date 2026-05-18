REM ═══════════════════════════════════════════════════════════════════════════
REM  INSPEC360 v2.2 - Criar Atalhos na Área de Trabalho
REM  Execute este arquivo para criar atalhos (execute como administrador)
REM ═══════════════════════════════════════════════════════════════════════════

@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   CRIANDO ATALHOS NA ÁREA DE TRABALHO                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Obter caminho da Área de Trabalho
set DESKTOP=%USERPROFILE%\Desktop

echo 📍 Área de Trabalho: %DESKTOP%
echo.

REM Criar atalho via PowerShell
echo ⏳ Criando atalhos...
powershell -NoProfile -Command ^
"$WshShell = New-Object -ComObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%DESKTOP%\INSPEC360.lnk'); ^
$Shortcut.TargetPath = '%~dp0EXECUTAR-INPEC360.bat'; ^
$Shortcut.WorkingDirectory = '%~dp0'; ^
$Shortcut.Description = 'INSPEC360 v2.2 - Sistema de Inspeção'; ^
$Shortcut.IconLocation = 'cmd.exe,0'; ^
$Shortcut.WindowStyle = 1; ^
$Shortcut.Save(); ^
Write-Host '✅ Atalho criado: INSPEC360.lnk'"

REM Criar atalho alternativo (VBS invisível)
powershell -NoProfile -Command ^
"$WshShell = New-Object -ComObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%DESKTOP%\INSPEC360 (Silencioso).lnk'); ^
$Shortcut.TargetPath = '%~dp0INPEC360.vbs'; ^
$Shortcut.WorkingDirectory = '%~dp0'; ^
$Shortcut.Description = 'INSPEC360 v2.2 - Iniciar sem janela de comando'; ^
$Shortcut.IconLocation = 'cmd.exe,0'; ^
$Shortcut.Save(); ^
Write-Host '✅ Atalho silencioso criado: INSPEC360 (Silencioso).lnk'"

echo.
echo ✅ Atalhos criados com sucesso!
echo.
echo 📌 Você agora tem na Área de Trabalho:
echo    1. INSPEC360.lnk - Mostra janela de comando
echo    2. INSPEC360 (Silencioso).lnk - Executa sem janelas
echo.
echo 💡 Próximas vezes, simplesmente duplo-clique em qualquer um!
echo.

pause
