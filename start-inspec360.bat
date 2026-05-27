@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  INSPEC360 v2.2 - Inicializador Completo
REM  Clique duplo para rodar o sistema completo
REM ═══════════════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

REM Adicionar Node.js Portável ao PATH para que funcione em subprocessos
set PATH=C:\PortableNode;%PATH%

REM ─────────────────────────────────────────────────────────────────────────
REM  1. VERIFICAR NODE.JS
REM ─────────────────────────────────────────────────────────────────────────

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   INSPEC360 v2.2 - INICIANDO SISTEMA                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo [1/6] Verificando Node.js...

node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Node.js NÃO está instalado!
    echo.
    echo Você precisa instalar Node.js v18+ de:
    echo 👉 https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% encontrado

REM ─────────────────────────────────────────────────────────────────────────
REM  2. INSTALAR DEPENDÊNCIAS DO BACKEND
REM ─────────────────────────────────────────────────────────────────────────

echo.
echo [2/6] Instalando dependências do backend...

cd backend
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do backend!
    pause
    exit /b 1
)
echo ✅ Dependências do backend instaladas
cd ..

REM ─────────────────────────────────────────────────────────────────────────
REM  3. VERIFICAR BANCO DE DADOS
REM ─────────────────────────────────────────────────────────────────────────

cd ..
echo.
echo [3/6] Verificando banco de dados...

if not exist "data\inspec360.db" (
    echo ⚠️  Banco não existe! Criando...
    cd backend
    call npm run init-db
    if errorlevel 1 (
        echo ❌ Erro ao criar banco!
        pause
        exit /b 1
    )
    echo ✅ Banco criado com sucesso
    cd ..
) else (
    echo ✅ Banco de dados OK
)

REM ─────────────────────────────────────────────────────────────────────────
REM  4. INICIAR BACKEND
REM ─────────────────────────────────────────────────────────────────────────

echo.
echo [4/6] Iniciando Backend...
echo.
echo 💡 Dica: Uma nova janela vai abrir. Não feche!
echo.

start "INSPEC360 Backend :3000" cmd /k "cd /d backend && npm run dev"

REM Aguardar o backend iniciar
timeout /t 3 /nobreak >nul

REM ─────────────────────────────────────────────────────────────────────────
REM  5. INSTALAR DEPENDÊNCIAS DO FRONTEND
REM ─────────────────────────────────────────────────────────────────────────

echo.
echo [5/6] Instalando dependências do frontend...

call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do frontend!
    pause
    exit /b 1
)
echo ✅ Dependências do frontend instaladas

REM ─────────────────────────────────────────────────────────────────────────
REM  6. INICIAR FRONTEND
REM ─────────────────────────────────────────────────────────────────────────

echo [6/6] Iniciando Frontend...
echo.
echo 💡 Dica: Outra janela vai abrir. Não feche!
echo.

start "INSPEC360 Frontend :5173" cmd /k "npm run dev"

REM Aguardar o frontend iniciar
timeout /t 5 /nobreak >nul

REM ─────────────────────────────────────────────────────────────────────────
REM  7. ABRIR NAVEGADOR
REM ─────────────────────────────────────────────────────────────────────────

echo.
echo ✅ Sistema iniciando...
echo.
echo 🌐 Abrindo navegador em http://localhost:5173
echo.

start http://localhost:5173

REM ─────────────────────────────────────────────────────────────────────────
REM  6. INFORMAÇÕES FINAIS
REM ─────────────────────────────────────────────────────────────────────────

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   ✅ INSPEC360 INICIADO COM SUCESSO!                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📡 URLs:
echo    Backend:  http://localhost:3000
echo    Frontend: http://localhost:5173
echo.
echo 🔐 Credenciais padrão:
echo    Email:   supervisor@inspec360.com
echo    Senha:   sup123
echo.
echo 💡 Você tem 2 janelas abertas (Backend + Frontend)
echo    Feche ambas para parar o sistema
echo.
echo 📚 Documentação: Veja QUICK_START.md
echo.

pause
