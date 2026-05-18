#!/bin/bash

# Script de inicialização do INSPEC360 v2.2

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   INSPEC360 v2.2 - Setup Automatizado                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar Node.js
echo "[1/4] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    echo ""
    echo "Baixe em: https://nodejs.org/ (recomendado v18+)"
    echo ""
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION encontrado"

# Instalar backend
echo ""
echo "[2/4] Instalando dependências do backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Falha ao instalar dependências do backend!"
    exit 1
fi
echo "✅ Backend configurado"

# Inicializar banco de dados
echo ""
echo "[3/4] Inicializando banco de dados SQLite..."
npm run init-db
if [ $? -ne 0 ]; then
    echo "❌ Falha ao inicializar banco de dados!"
    exit 1
fi
echo "✅ Banco de dados criado"

# Instalar frontend
cd ..
echo ""
echo "[4/4] Instalando dependências do frontend..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Falha ao instalar dependências do frontend!"
    exit 1
fi
echo "✅ Frontend configurado"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✅ Setup Completo!                                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Para iniciar o sistema, abra 2 terminais:"
echo ""
echo "Terminal 1 (Backend):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "   npm run dev"
echo ""
echo "🌐 URLs:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend:  http://localhost:3000"
echo ""
echo "🔑 Credenciais padrão:"
echo "   - Admin:     admin@inspec360.com / admin123"
echo "   - Supervisor: supervisor@inspec360.com / sup123"
echo "   - Técnico:   tecnico1@inspec360.com / tec123"
echo ""
