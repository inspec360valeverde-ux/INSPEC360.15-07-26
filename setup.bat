@echo off
REM Script de inicialização do INSPEC360 v2.2

REM Adicionar Node.js Portável ao PATH
set PATH=C:\PortableNode;%PATH%

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   INSPEC360 v2.2 - Setup Automatizado                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não está instalado!
    echo.
    echo Baixe em: https://nodejs.org/ ^(recomendado v18+^)
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% encontrado

REM Instalar backend
echo.
echo [2/4] Instalando dependências do backend...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Falha ao instalar dependências do backend!
    pause
    exit /b 1
)
echo ✅ Backend configurado

REM Inicializar banco de dados
echo.
echo [3/4] Inicializando banco de dados SQLite...
call npm run init-db
if errorlevel 1 (
    echo ❌ Falha ao inicializar banco de dados!
    pause
    exit /b 1
)
echo ✅ Banco de dados criado

REM Instalar frontend
cd ..
echo.
echo [4/4] Instalando dependências do frontend...
call npm install
if errorlevel 1 (
    echo ❌ Falha ao instalar dependências do frontend!
    pause
    exit /b 1
)
echo ✅ Frontend configurado

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   ✅ Setup Completo!                                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📝 Para iniciar o sistema, abra 2 terminais:
echo.
echo Terminal 1 ^(Backend^):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 ^(Frontend^):
echo   npm run dev
echo.
echo 🌐 URLs:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:3000
echo.
echo 🔑 Credenciais padrão:
echo   - Admin:     admin@inspec360.com / admin123
echo   - Supervisor: supervisor@inspec360.com / sup123
echo   - Técnico:   tecnico1@inspec360.com / tec123
echo.
pause
