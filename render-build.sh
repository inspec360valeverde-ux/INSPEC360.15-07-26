#!/bin/bash
set -e

echo "🚀 Building INSPEC360 on Render"
echo "================================"

# Passo 0: Limpar tudo antigo
echo "🗑️  Limpando builds anteriores..."
rm -rf dist .vite node_modules/.vite

# Passo 1: Instalar pnpm globalmente
echo "📦 Garantindo pnpm disponível..."
npm install -g pnpm

# Passo 2: Atualizar versão
echo "📦 Atualizando versão.json..."
node scripts/update-version.js

# Passo 3: Instalar dependências do root
echo "📦 Instalando dependências root..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Passo 4: Build do frontend
echo "🎨 Construindo frontend com Vite (FORÇADO)..."
rm -rf dist
pnpm run build

# Verificar se dist foi criado
if [ ! -d "dist" ]; then
  echo "❌ ERRO CRÍTICO: dist não foi criado!"
  ls -la
  exit 1
fi
echo "✅ dist criado com sucesso!"

# Passo 5: Instalar dependências do backend
echo "🔧 Instalando dependências backend..."
cd backend
npm install
cd ..

echo "✅ Build completed successfully!"
echo "================================"
echo "💡 Starting application on port 3000..."

