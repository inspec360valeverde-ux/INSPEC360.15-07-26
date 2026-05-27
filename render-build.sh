#!/bin/bash
set -e

echo "🚀 Building INSPEC360 on Render"
echo "================================"

# Install Node version manager if needed
echo "📦 Ensuring pnpm is available..."
npm install -g pnpm

# Install root dependencies
echo "📦 Installing root dependencies with pnpm..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Build frontend
echo "🎨 Building frontend with Vite..."
pnpm build

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ Build completed successfully!"
echo "================================"
echo "💡 Starting application on port 3000..."

