@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  INSPEC360 v2.2 - Inicializador com Um Clique
REM  Duplo clique para rodar tudo automaticamente
REM ═══════════════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

REM Adicionar Node.js Portável ao PATH
set PATH=C:\PortableNode;%PATH%

REM Obter diretório do script
cd /d "%~dp0"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   INSPEC360 v2.2 - INICIANDO COM UM CLIQUE                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo.
    echo Baixe em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% encontrado
echo.

REM Verificar dependências instaladas
echo [2/4] Verificando dependências...
if not exist "backend\node_modules" (
    echo    Instalando dependências do backend...
    cd backend
    call npm install --silent
    cd ..
)
if not exist "node_modules" (
    echo    Instalando dependências do frontend...
    call npm install --silent
)
echo ✅ Dependências prontas
echo.

REM Iniciar Backend em nova janela
echo [3/4] Iniciando Backend (porta 3000)...
start "INSPEC360 - Backend" cmd /k "cd /d "!CD!\backend" && npm run dev"
timeout /t 3 /nobreak

REM Iniciar Frontend em nova janela
echo [4/4] Iniciando Frontend (porta 5173)...
start "INSPEC360 - Frontend" cmd /k "cd /d "!CD!" && npm run dev"
timeout /t 3 /nobreak

REM Aguardar um pouco e abrir navegador
timeout /t 5 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   ✅ INSPEC360 INICIADO COM SUCESSO                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Abrindo navegador...
start "" http://localhost:5173
echo.
echo 📡 Backend:  http://localhost:3000
echo 🖥️  Frontend: http://localhost:5173
echo.
echo 🔐 Credenciais:
echo    Email: supervisor@inspec360.com
echo    Senha: sup123
echo.
echo ⚠️  NÃO FECHE as janelas do Backend e Frontend!
echo.
timeout /t 60 /nobreak

exit /b 0
