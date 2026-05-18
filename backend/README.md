# INSPEC360 Backend

Backend Node.js/Express para o sistema INSPEC360 v2.2

## Instalação

```bash
cd backend
npm install
# ou
pnpm install
```

## Inicializar Banco de Dados

```bash
npm run init-db
```

Isso criará o arquivo SQLite em `data/inspec360.db` com todas as tabelas e dados iniciais.

## Executar em Desenvolvimento

```bash
npm run dev
```

O servidor estará em `http://localhost:3000`

## Executar em Produção

```bash
npm start
```

## Estrutura de Pastas

```
backend/
├── src/
│   ├── database/
│   │   ├── connection.js      # Conexão com SQLite
│   │   ├── init.js            # Inicialização do banco
│   │   └── queries.js         # Todas as queries
│   ├── routes/
│   │   ├── users.js
│   │   ├── structures.js
│   │   ├── components.js
│   │   ├── serviceOrders.js
│   │   ├── inspections.js
│   │   ├── executions.js
│   │   └── photos.js
│   └── server.js              # Servidor principal
├── package.json
└── README.md
```

## API Endpoints

### Usuários
- `GET /api/users` - Listar todos
- `POST /api/users` - Criar novo
- `POST /api/users/login` - Login
- `GET /api/users/:id` - Obter por ID
- `PUT /api/users/:id` - Atualizar

### Estruturas
- `GET /api/structures` - Listar todas
- `POST /api/structures` - Criar nova
- `GET /api/structures/:id` - Obter por ID
- `PUT /api/structures/:id` - Atualizar

### Componentes
- `GET /api/components` - Listar todos
- `POST /api/components` - Criar novo
- `GET /api/components/:id` - Obter por ID

### Ordens de Serviço
- `GET /api/service-orders` - Listar todas
- `POST /api/service-orders` - Criar nova
- `GET /api/service-orders/:id` - Obter por ID
- `PUT /api/service-orders/:id` - Atualizar

### Inspeções
- `GET /api/inspections` - Listar todas
- `POST /api/inspections` - Criar nova
- `GET /api/inspections/:id` - Obter por ID
- `PUT /api/inspections/:id` - Atualizar
- `POST /api/inspections/:id/components` - Adicionar componente
- `POST /api/inspections/:id/anomalies` - Adicionar anomalia
- `POST /api/inspections/:id/pause` - Pausar
- `PUT /api/inspections/pause/:pauseId/resume` - Retomar

### Execuções
- `GET /api/executions` - Listar todas
- `POST /api/executions` - Criar nova
- `GET /api/executions/:id` - Obter por ID
- `PUT /api/executions/:id` - Atualizar

### Fotos
- `POST /api/photos/upload` - Upload de foto
- `GET /api/photos/:inspectionId` - Listar fotos da inspeção

## Banco de Dados

SQLite local com as seguintes tabelas:
- `users` - Usuários do sistema
- `structures` - Estruturas/torres
- `componentRules` - Regras de componentes
- `serviceOrders` - Ordens de serviço
- `inspectionRecords` - Registros de inspeção
- `componentInspections` - Componentes inspecionados
- `anomalies` - Anomalias encontradas
- `inspectionPhotos` - Fotos das inspeções
- `pauseHistory` - Histórico de pausas
- `executionRecords` - Registros de execução

## Dados Iniciais

O banco é inicializado com:
- 1 Super Admin (admin@inspec360.com / admin123)
- 1 Supervisor (supervisor@inspec360.com / sup123)
- 1 Técnico (tecnico1@inspec360.com / tec123)
- 6 Componentes padrão (Isoladores, Ferragens, Cadeias, etc.)

## Pasta de Imagens

As imagens de inspeção são armazenadas em:
```
public/images/inspections/
```

Organizadas por ID de inspeção e tipo de componente.

## Sincronização com Frontend

O frontend acessa a API através de `http://localhost:3000/api`

Exemplo:
```javascript
// Frontend API Client
const API_URL = 'http://localhost:3000/api';

// Listar estruturas
const res = await fetch(`${API_URL}/structures`);
const structures = await res.json();
```
