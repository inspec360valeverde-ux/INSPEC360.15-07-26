
# INSPEC360 v2.2 - Sistema Completo

> **Sistema de Inspeção de Estruturas de Transmissão** - Backend + Frontend + Banco de Dados Local

## 🎯 O que foi criado

### ✅ Backend Completo (Node.js/Express)
- API REST com 7 rotas principais
- Banco SQLite local com 10 tabelas
- Sincronização automática
- Upload de fotos com organização por pasta
- Autenticação simples + denormalização

### ✅ Integração Frontend-Backend
- Cliente API (`src/api/client.js`)
- Store integrado (`src/app/data/backendStore.ts`)
- Sincronização bidirecional
- Fallback para localStorage

### ✅ Estrutura de Arquivos
- Pasta `data/` - Banco SQLite local
- Pasta `public/images/inspections/` - Imagens das inspeções
- Backend com documentação completa

## 🚀 Quick Start

### ⚡ Forma Mais Rápida (Windows)

**Clique duplo em:**
```
start-inspec360.vbs
```

Isso abre Backend + Frontend + Navegador automaticamente! ✅

---

### 📋 Instalação Completa

#### Pré-requisito
**Instale Node.js v18+**: https://nodejs.org/

#### Windows
```bash
setup.bat
```

#### macOS/Linux
```bash
chmod +x setup.sh
./setup.sh
```

#### Manual
```bash
# Backend
cd backend
npm install
npm run init-db

# Frontend (outro terminal)
npm install
```

## 📡 Iniciar Sistema

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
→ Roda em `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
→ Roda em `http://localhost:5173`

## 🔐 Credenciais Padrão

| Usuário | Email | Senha |
|---------|-------|-------|
| Admin | admin@inspec360.com | admin123 |
| Supervisor | supervisor@inspec360.com | sup123 |
| Técnico | tecnico1@inspec360.com | tec123 |

## 📁 Estrutura do Projeto

```
INPEC360 V2/
│
├── backend/                          # 🔧 Backend Node.js
│   ├── src/
│   │   ├── database/
│   │   │   ├── connection.js        # Conexão SQLite
│   │   │   ├── init.js              # Inicialização (cria tabelas)
│   │   │   └── queries.js           # Todas as queries
│   │   ├── routes/
│   │   │   ├── users.js             # /api/users
│   │   │   ├── structures.js        # /api/structures
│   │   │   ├── components.js        # /api/components
│   │   │   ├── serviceOrders.js     # /api/service-orders
│   │   │   ├── inspections.js       # /api/inspections
│   │   │   ├── executions.js        # /api/executions
│   │   │   └── photos.js            # /api/photos
│   │   └── server.js                # Servidor principal
│   ├── package.json
│   └── README.md
│
├── src/                             # 🎨 Frontend React/Vite
│   ├── api/
│   │   └── client.js                # Cliente da API
│   ├── app/
│   │   ├── data/
│   │   │   ├── store.ts             # Store local
│   │   │   ├── backendStore.ts      # ⭐ Store integrado
│   │   │   └── types.ts
│   │   └── components/
│   └── ...
│
├── public/
│   └── images/
│       └── inspections/             # 📸 Folder de imagens
│
├── data/
│   └── inspec360.db                 # 🗄️ Banco SQLite
│
├── .env.local                       # ⚙️ Configuração (já criado)
├── setup.bat                        # 🪟 Setup Windows
├── setup.sh                         # 🐧 Setup Unix
├── SETUP.md                         # 📚 Documentação
└── README.md                        # (este arquivo)
```

## 📡 API Endpoints

### Usuários
```bash
GET     /api/users                    # Listar todos
GET     /api/users/:id                # Obter por ID
POST    /api/users                    # Criar novo
POST    /api/users/login              # Login
PUT     /api/users/:id                # Atualizar
```

### Estruturas
```bash
GET     /api/structures               # Listar todas
GET     /api/structures/:id           # Obter por ID
POST    /api/structures               # Criar nova
PUT     /api/structures/:id           # Atualizar
```

### Componentes
```bash
GET     /api/components               # Listar todos
GET     /api/components/:id           # Obter por ID
POST    /api/components               # Criar novo
```

### Ordens de Serviço
```bash
GET     /api/service-orders           # Listar todas
GET     /api/service-orders/:id       # Obter por ID
POST    /api/service-orders           # Criar nova
PUT     /api/service-orders/:id       # Atualizar
```

### Inspeções
```bash
GET     /api/inspections              # Listar todas
GET     /api/inspections/:id          # Obter por ID
POST    /api/inspections              # Criar nova
PUT     /api/inspections/:id          # Atualizar
POST    /api/inspections/:id/components          # Adicionar componente
POST    /api/inspections/:id/anomalies           # Adicionar anomalia
POST    /api/inspections/:id/pause               # Pausar
PUT     /api/inspections/pause/:pauseId/resume   # Retomar
POST    /api/inspections/:id/photos              # Adicionar foto
```

### Execuções
```bash
GET     /api/executions               # Listar todas
GET     /api/executions/:id           # Obter por ID
POST    /api/executions               # Criar nova
PUT     /api/executions/:id           # Atualizar
```

### Fotos
```bash
POST    /api/photos/upload            # Upload de arquivo
GET     /api/photos/:inspectionId     # Listar fotos
```

## 💾 Banco de Dados

SQLite com 10 tabelas:
- `users` - Usuários (admin, supervisor, técnico)
- `structures` - Estruturas/torres
- `componentRules` - Componentes padrão
- `serviceOrders` - Ordens de serviço
- `inspectionRecords` - Inspeções
- `componentInspections` - Componentes da inspeção
- `anomalies` - Anomalias encontradas
- `inspectionPhotos` - Fotos
- `pauseHistory` - Histórico de pausas
- `executionRecords` - Execuções

**Localização:** `data/inspec360.db`

## 🔄 Sincronização Frontend-Backend

O frontend usa `backendStore` para sincronização automática:

```typescript
// src/app/data/backendStore.ts

import { inspectionStore, structureStore } from '@/app/data/backendStore';

// ✅ Listar estruturas
const structures = await structureStore.getAll();

// ✅ Criar inspeção
const inspection = await inspectionStore.create({
  orderId: 'ord_123',
  estruturaId: 'str_001',
  supervisorId: 'usr_supervisor_001',
  tecnicoId: 'usr_tecnico_001',
  // ...
});

// ✅ Upload de foto
const photo = await inspectionStore.uploadPhoto(
  inspectionId,
  file,
  { 
    componentId: 'isoladores',
    caption: 'Foto da anomalia encontrada'
  }
);

// ✅ Pausar/Retomar
await inspectionStore.pause(inspectionId, {
  userId: 'usr_001',
  userName: 'Técnico Silva',
  motivo: 'Chuva'
});
```

## 📸 Organização de Imagens

```
public/images/inspections/
├── {photo_id_1}.jpg
├── {photo_id_2}.jpg
└── {photo_id_3}.jpg
```

Metadados armazenados em `inspectionPhotos`:
- `filePath` - Caminho relativo da imagem
- `inspectionId` - ID da inspeção
- `componentId` - Componente (isoladores, estrutura, etc)
- `anomalyId` - Anomalia (se aplicável)
- `caption` - Legenda
- `timestamp` - Data/hora capturada

## 🛠️ Desenvolvimento

### Adicionar novo endpoint

1. **Criar query** em `backend/src/database/queries.js`
2. **Criar rota** em `backend/src/routes/novo.js`
3. **Importar em** `backend/src/server.js`
4. **Criar método** em `src/api/client.js`
5. **Usar em** `src/app/data/backendStore.ts`

## ✅ Componentes Padrão (pré-carregados)

| ID | Nome | Anomalias |
|----|------|-----------|
| isoladores | Isoladores | Trinca, Rachadura, Descascamento, Contaminação, Sujeira |
| ferragens | Ferragens | Corrosão, Soltura, Flexão, Fissura, Oxidação |
| cadeias | Cadeias de Isoladores | Isolador quebrado, Desvio, Falta de proteção |
| para_raios | Para-raios | Desconexão, Corrosão, Dano físico, Falta de aterramento |
| condutores | Condutores | Emenda danificada, Queimadura, Torção, Desgaste |
| estrutura | Estrutura da Torre | Corrosão, Fissura, Desalinhamento, Flexão, Falta de pintura |

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar porta 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Reiniciar banco
rm data/inspec360.db
cd backend
npm run init-db
```

### Frontend não conecta API
- Verificar `.env.local` contém `VITE_API_URL=http://localhost:3000/api`
- Backend está rodando em `http://localhost:3000`?
- Verificar console do navegador para erros

### Imagens não salvam
```bash
# Criar pasta se não existir
mkdir -p public/images/inspections

# Verificar permissões
chmod -R 777 public/images  # Unix
```

### Banco de dados corrompido
```bash
# Deletar e reinicializar
rm data/inspec360.db
cd backend
npm run init-db
```

## 📚 Documentação Adicional

- [Backend README](backend/README.md) - Detalhes técnicos do servidor
- [Database Schema](DATABASE_SCHEMA.md) - Estrutura completa das tabelas
- [Setup Guide](SETUP.md) - Instruções completas de instalação

## 📊 Dados de Teste Pré-carregados

Ao executar `npm run init-db`, o sistema cria:

**Usuários (3):**
- 1 Super Admin
- 1 Supervisor
- 1 Técnico

**Componentes (6):**
- Isoladores, Ferragens, Cadeias, Para-raios, Condutores, Estrutura

Pronto para adicionar estruturas e ordens de serviço via API!

---

**Versão:** 2.2.0  
**Data:** 07/05/2026  
**Status:** ✅ Backend completo, integrado e pronto para testes
  