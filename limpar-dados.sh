#!/bin/bash

# 🧹 Script para Limpar Dados Simulados - INSPEC360 v2.2
# Este script executa limpeza via HTTP (recomendado)
#
# ✅ Funciona em: Windows (Git Bash), Mac, Linux
# ✅ Requer: curl (já instalado na maioria dos SOs)

echo ""
echo "============================================================"
echo "🧹 LIMPEZA DE DADOS SIMULADOS - INSPEC360 v2.2"
echo "============================================================"
echo ""

# Detectar URL baseado no argumento
URL="${1:-https://inspec360-v2-1.onrender.com/api/admin/clean-data}"

if [ "$1" = "" ]; then
    echo "📍 Usando URL padrão (Render): $URL"
else
    echo "📍 Usando URL customizada: $URL"
fi

echo ""
echo "⚠️  AVISO: Esta operação é IRREVERSÍVEL!"
echo "   • Todos os dados simulados serão deletados"
echo "   • Apenas 3 usuários de teste serão mantidos"
echo "   • Banco será restaurado à estrutura vazia"
echo ""

read -p "Digite SIM para confirmar (ou qualquer outra coisa para cancelar): " CONFIRM

if [ "$CONFIRM" != "SIM" ]; then
    echo "❌ Operação cancelada pelo usuário"
    exit 1
fi

echo ""
echo "🔄 Conectando ao servidor..."
echo ""

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"secret":"inspec360-admin-2026"}' \
  --verbose

echo ""
echo ""
echo "✅ Requisição enviada!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Se recebeu status 200 (OK), a limpeza foi concluída"
echo "   2. Se recebeu status 401, a chave está errada"
echo "   3. Se recebeu status 500, verifique banco de dados"
echo ""
echo "🌐 Acesse https://inspec360-v2-1.onrender.com para verificar"
echo ""
