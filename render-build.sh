#!/bin/bash
set -e

echo "🚀 Building INSPEC360 v2.1 on Render"

# Install pnpm
npm install -g pnpm

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install and build frontend
echo "🎨 Building frontend..."
pnpm install
pnpm build

# Install and prepare backend
echo "🔧 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ Build completed successfully!"
