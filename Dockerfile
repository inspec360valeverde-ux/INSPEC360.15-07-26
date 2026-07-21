# Build Stage - Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copiar package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY public ./public
COPY src ./src
COPY scripts ./scripts
COPY tsconfig.json vite.config.ts postcss.config.mjs index.html ./
COPY guidelines ./guidelines

# Instalar pnpm fresh
RUN npm install -g pnpm@latest

# Limpar cache do pnpm
RUN pnpm store prune || true

# Instalar dependências (fresh)
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install --no-frozen-lockfile

# Atualizar version.json
RUN node scripts/update-version.js

# Build frontend
RUN echo "🔨 [Dockerfile] Iniciando build do frontend..." && \
    pnpm run build && \
    echo "✅ [Dockerfile] Build do frontend completado!" && \
    ls -la dist/

# Verificar se dist foi criado
RUN if [ ! -d "dist" ]; then echo "❌ ERRO: dist não foi criado!"; ls -la; exit 1; fi

---

# Backend Stage
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package.json backend/pnpm-lock.yaml ./

RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile 2>/dev/null || pnpm install --no-frozen-lockfile

COPY backend/src ./src

---

# Final Stage
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm no container final
RUN npm install -g pnpm@latest

# Copiar frontend build
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./package.json

# Copiar backend
COPY --from=backend-builder /app/backend/src ./backend/src
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY backend/data ./backend/data

# Verificar que dist existe
RUN echo "🔍 [Dockerfile] Verificando dist..." && \
    ls -la dist/ && \
    ls -la dist/index.html && \
    echo "✅ [Dockerfile] dist verificado com sucesso!"

# Start
ENV NODE_ENV=production
ENV PORT=10000

CMD ["node", "backend/src/server.js"]
