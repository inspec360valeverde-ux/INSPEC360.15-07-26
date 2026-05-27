@echo off
REM ========================================
REM Script para fazer Deploy com GitHub e Render
REM ========================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║     INSPEC360 v2.1 - Deploy com GitHub e Render           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não está instalado!
    echo Baixe em: https://git-scm.com
    pause
    exit /b 1
)

echo ✅ Git detectado
echo.

REM Perguntar informações necessárias
echo Digite as seguintes informações:
echo.
set /p GITHUB_USER="GitHub Username (ex: seu-usuario): "
set /p REPO_NAME="Nome do repositório (ex: inspec360-v2): "
set /p YOUR_NAME="Seu nome completo: "
set /p YOUR_EMAIL="Seu email GitHub: "

echo.
echo ─────────────────────────────────────────────────────────────
echo ⏳ Configurando Git...
echo ─────────────────────────────────────────────────────────────

REM Configurar Git
git config user.name "%YOUR_NAME%"
git config user.email "%YOUR_EMAIL%"

REM Inicializar repositório se não existir
if not exist ".git" (
    echo Inicializando repositório...
    git init
    git branch -M main
)

REM Adicionar todos os arquivos
echo Adicionando arquivos...
git add .

REM Criar commit
git commit -m "Inicialização INSPEC360 v2.1 - Deploy com Render"

echo.
echo ─────────────────────────────────────────────────────────────
echo 📋 Próximos Passos:
echo ─────────────────────────────────────────────────────────────
echo.
echo 1. Acesse: https://github.com/new
echo.
echo 2. Crie um novo repositório com o nome: %REPO_NAME%
echo    (NÃO marque "Initialize this repository with")
echo.
echo 3. Após criar, execute este comando:
echo.
echo    git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
echo    git push -u origin main
echo.
echo 4. Acesse: https://dashboard.render.com
echo.
echo 5. Crie um novo Blueprint e conecte ao repositório
echo.
echo ✅ Os arquivos estão prontos para fazer push!
echo.
pause
