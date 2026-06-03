#!/bin/bash

echo "🔍 Diagnóstico do Sistema INSPEC360 v2.1"
echo "========================================="
echo ""

# 1. Verificar variável DATABASE_URL
echo "📋 1. Verificando DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL não está configurada"
  echo "   Configure com: export DATABASE_URL='postgresql://user:pass@host:port/dbname'"
else
  echo "✅ DATABASE_URL está configurada"
  # Mostrar apenas parte da URL por segurança
  SAFE_URL=$(echo $DATABASE_URL | sed 's/:.*@/@/g')
  echo "   URL: $SAFE_URL"
fi
echo ""

# 2. Verificar conexão com banco
echo "🗄️  2. Testando conexão com PostgreSQL..."
if command -v psql &> /dev/null; then
  if psql $DATABASE_URL -c "SELECT 1;" &> /dev/null; then
    echo "✅ Conexão com PostgreSQL bem-sucedida"
  else
    echo "❌ Erro ao conectar com PostgreSQL"
    echo "   Verifique:"
    echo "   - Se o servidor PostgreSQL está rodando"
    echo "   - Se a DATABASE_URL está correta"
    echo "   - Se as credenciais estão certas"
  fi
else
  echo "⚠️  psql não instalado, pulando teste de conexão"
fi
echo ""

# 3. Verificar tabelas
echo "📊 3. Verificando tabelas do banco..."
if command -v psql &> /dev/null; then
  TABLES=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null)
  if [ -n "$TABLES" ]; then
    echo "✅ Banco tem $TABLES tabelas"
  else
    echo "❌ Erro ao acessar tabelas"
  fi
else
  echo "⚠️  psql não instalado"
fi
echo ""

# 4. Verificar variáveis de ambiente obrigatórias
echo "🔐 4. Verificando variáveis de ambiente..."
MISSING=0
for var in DATABASE_URL PORT CORS_ORIGIN; do
  if [ -z "${!var}" ]; then
    echo "❌ $var não configurada"
    MISSING=$((MISSING + 1))
  else
    echo "✅ $var configurada"
  fi
done
echo ""

# 5. Verificar se servidor está rodando
echo "🚀 5. Verificando se servidor está rodando..."
if command -v curl &> /dev/null; then
  PORT=${PORT:-3001}
  RESPONSE=$(curl -s -w "%{http_code}" http://localhost:$PORT/api/health -o /dev/null)
  if [ "$RESPONSE" = "200" ]; then
    echo "✅ Servidor está respondendo em http://localhost:$PORT"
  else
    echo "❌ Servidor não respondeu (HTTP $RESPONSE)"
    echo "   Verifique se está rodando: npm start"
  fi
else
  echo "⚠️  curl não instalado"
fi
echo ""

echo "========================================="
if [ $MISSING -eq 0 ]; then
  echo "✅ Tudo parece estar OK!"
else
  echo "❌ $MISSING variável(is) não configurada(s)"
fi
