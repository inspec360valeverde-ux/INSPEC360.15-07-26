@echo off
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   TESTE DE BANCO DE DADOS - INSPEC360 v2.2               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Adicionar Node.js Portável ao PATH
set PATH=C:\PortableNode;%PATH%

REM Teste 1: Health Check
echo [1/5] Teste de Conectividade (Health Check)...
powershell -Command "$response = Invoke-WebRequest -Uri http://localhost:3000/api/health -Method Get; $data = $response.Content | ConvertFrom-Json; Write-Host '✅ Backend respondendo: ' -NoNewline; Write-Host $data.status -ForegroundColor Green"

REM Teste 2: Listar Usuários
echo.
echo [2/5] Teste: Listar Usuários...
powershell -Command "$response = Invoke-WebRequest -Uri http://localhost:3000/api/users -Method Get; $data = $response.Content | ConvertFrom-Json; Write-Host '✅ Usuários no banco: ' -NoNewline; Write-Host $data.Count -ForegroundColor Green"

REM Teste 3: Criar Usuário
echo.
echo [3/5] Teste: Criar novo usuário...
set USER_JSON={"name":"Admin Teste","email":"admin@inspec360.com","password":"admin123","role":"superadm"}
powershell -Command "$json = '{\"name\":\"Admin Teste\",\"email\":\"admin@inspec360.com\",\"password\":\"admin123\",\"role\":\"superadm\"}'; $response = Invoke-WebRequest -Uri http://localhost:3000/api/users -Method Post -ContentType 'application/json' -Body $json; $data = $response.Content | ConvertFrom-Json; if($data.id) { Write-Host '✅ Usuário criado: ' -NoNewline; Write-Host $data.email -ForegroundColor Green } else { Write-Host '❌ Erro: ' -NoNewline; Write-Host $data.error -ForegroundColor Red }"

REM Teste 4: Listar Componentes
echo.
echo [4/5] Teste: Listar Componentes (Regras)...
powershell -Command "$response = Invoke-WebRequest -Uri http://localhost:3000/api/components -Method Get; $data = $response.Content | ConvertFrom-Json; Write-Host '✅ Componentes encontrados: ' -NoNewline; Write-Host $data.Count -ForegroundColor Green"

REM Teste 5: Verificar Banco de Dados
echo.
echo [5/5] Teste: Arquivo de Banco de Dados...
if exist "c:\INPEC360 V2\data\inspec360.db" (
    for %%A in ("c:\INPEC360 V2\data\inspec360.db") do (
        set SIZE=%%~zA
        if !SIZE! gtr 0 (
            echo ✅ Banco de dados criado: !SIZE! bytes
        ) else (
            echo ❌ Banco de dados vazio
        )
    )
) else (
    echo ❌ Arquivo de banco de dados não encontrado
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   TESTES CONCLUÍDOS                                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause
