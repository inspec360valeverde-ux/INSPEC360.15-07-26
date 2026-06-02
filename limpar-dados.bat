@REM 🧹 Script para Limpar Dados Simulados - INSPEC360 v2.2
@REM Este script executa limpeza via HTTP (recomendado)
@REM
@REM ✅ Funciona em: Windows, Mac, Linux
@REM ✅ Requer: curl (já instalado na maioria dos SOs)

@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo 🧹 LIMPEZA DE DADOS SIMULADOS - INSPEC360 v2.2
echo ============================================================
echo.

REM Detectar URL baseado no argumento
if "%1"=="" (
    set "URL=https://inspec360-v2-1.onrender.com/api/admin/clean-data"
    echo 📍 Usando URL padrão (Render): !URL!
) else (
    set "URL=%1"
    echo 📍 Usando URL customizada: !URL!
)

echo.
echo ⚠️  AVISO: Esta operação é IRREVERSÍVEL!
echo    • Todos os dados simulados serão deletados
echo    • Apenas 3 usuários de teste serão mantidos
echo    • Banco será restaurado à estrutura vazia
echo.

set /p CONFIRM="Digite SIM para confirmar (ou qualquer outra coisa para cancelar): "

if /i not "%CONFIRM%"=="SIM" (
    echo ❌ Operação cancelada pelo usuário
    exit /b 1
)

echo.
echo 🔄 Conectando ao servidor...
echo.

curl -X POST !URL! ^
  -H "Content-Type: application/json" ^
  -d "{\"secret\":\"inspec360-admin-2026\"}" ^
  --silent --show-error ^
  --include

echo.
echo.
echo ✅ Requisição enviada!
echo.
echo 📋 Próximos passos:
echo    1. Se recebeu status 200 (OK), a limpeza foi concluída
echo    2. Se recebeu status 401, a chave está errada
echo    3. Se recebeu status 500, verifique banco de dados
echo.
echo 🌐 Acesse https://inspec360-v2-1.onrender.com para verificar
echo.

pause
