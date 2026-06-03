# Diagnóstico INSPEC360 v2.1 - Windows

Write-Host "🔍 Diagnóstico do Sistema INSPEC360 v2.1" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar variável DATABASE_URL
Write-Host "📋 1. Verificando DATABASE_URL..." -ForegroundColor Yellow
if (-not $env:DATABASE_URL) {
  Write-Host "❌ DATABASE_URL não está configurada" -ForegroundColor Red
  Write-Host "   Configure com: `$env:DATABASE_URL='postgresql://user:pass@host:port/dbname'" -ForegroundColor Gray
} else {
  Write-Host "✅ DATABASE_URL está configurada" -ForegroundColor Green
  # Mostrar apenas parte da URL por segurança
  $SAFE_URL = $env:DATABASE_URL -replace ':[^@]*@', ':***@'
  Write-Host "   URL: $SAFE_URL" -ForegroundColor Gray
}
Write-Host ""

# 2. Verificar Node.js
Write-Host "📦 2. Verificando Node.js..." -ForegroundColor Yellow
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
  $nodeVersion = node --version
  Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
  Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
}
Write-Host ""

# 3. Verificar npm
Write-Host "📦 3. Verificando npm..." -ForegroundColor Yellow
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($npm) {
  $npmVersion = npm --version
  Write-Host "✅ npm instalado: v$npmVersion" -ForegroundColor Green
} else {
  Write-Host "❌ npm não encontrado" -ForegroundColor Red
}
Write-Host ""

# 4. Verificar variáveis de ambiente obrigatórias
Write-Host "🔐 4. Verificando variáveis de ambiente..." -ForegroundColor Yellow
$required = @("DATABASE_URL", "PORT", "CORS_ORIGIN")
$missing = 0
foreach ($var in $required) {
  $value = [Environment]::GetEnvironmentVariable($var)
  if (-not $value) {
    Write-Host "❌ $var não configurada" -ForegroundColor Red
    $missing++
  } else {
    Write-Host "✅ $var configurada" -ForegroundColor Green
  }
}
Write-Host ""

# 5. Verificar se porta está em uso
Write-Host "🚀 5. Verificando porta..." -ForegroundColor Yellow
$port = $env:PORT -or 3001
$portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($portInUse) {
  Write-Host "⚠️  Porta $port já está em uso" -ForegroundColor Yellow
  Write-Host "   Pode estar um servidor anterior ainda rodando" -ForegroundColor Gray
} else {
  Write-Host "✅ Porta $port disponível" -ForegroundColor Green
}
Write-Host ""

# 6. Verificar estrutura de diretórios
Write-Host "📂 6. Verificando estrutura de diretórios..." -ForegroundColor Yellow
$dirs = @(
  "backend/src",
  "src",
  "public"
)
foreach ($dir in $dirs) {
  if (Test-Path $dir) {
    Write-Host "✅ $dir encontrado" -ForegroundColor Green
  } else {
    Write-Host "❌ $dir não encontrado" -ForegroundColor Red
  }
}
Write-Host ""

# Resumo
Write-Host "=========================================" -ForegroundColor Cyan
if ($missing -eq 0 -and $node -and $npm) {
  Write-Host "✅ Sistema pronto para rodar!" -ForegroundColor Green
  Write-Host "   Execute: npm start" -ForegroundColor Gray
} else {
  Write-Host "❌ Problemas encontrados:" -ForegroundColor Red
  if ($missing -gt 0) {
    Write-Host "   - $missing variável(is) de ambiente não configurada(s)" -ForegroundColor Gray
  }
  if (-not $node) {
    Write-Host "   - Node.js não instalado" -ForegroundColor Gray
  }
  if (-not $npm) {
    Write-Host "   - npm não instalado" -ForegroundColor Gray
  }
}
Write-Host ""

# Instruções de configuração
Write-Host "📖 Instruções de Configuração:" -ForegroundColor Cyan
Write-Host "1. Configure a DATABASE_URL com a string de conexão PostgreSQL" -ForegroundColor Gray
Write-Host "2. Certifique-se que PostgreSQL está rodando" -ForegroundColor Gray
Write-Host "3. Execute: npm install" -ForegroundColor Gray
Write-Host "4. Execute: npm start" -ForegroundColor Gray
Write-Host ""
