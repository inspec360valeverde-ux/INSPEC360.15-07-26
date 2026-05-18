# 🗄️ LOCALIZAÇÃO DE TODOS OS DADOS - INSPEC360 V2.2

## 📍 Estrutura de Armazenamento

```
C:\INPEC360 V2\
│
├── backend/
│   ├── data/
│   │   └── inspec360.db ⭐⭐⭐ BANCO DE DADOS PRINCIPAL
│   │       ├── Usuários
│   │       ├── Estruturas de linha de transmissão
│   │       ├── Ordens de serviço (inspeção/execução)
│   │       ├── Inspeções registradas
│   │       ├── Componentes inspecionados
│   │       ├── Anomalias detectadas
│   │       ├── Histórico de pausas
│   │       └── Fotos de inspeção (referências)
│   └── src/database/
│       ├── connection.js (Gerencia conexão e persistência)
│       ├── init.js (Cria tabelas e dados iniciais)
│       └── queries.js (Operações CRUD)
│
├── public/images/inspections/
│   └── [FOTOS DAS INSPEÇÕES - Armazenamento de mídia]
│       ├── 2026-05-15/
│       ├── estrutura_123_anomalia_001.jpg
│       └── [etc...]
│
├── backend/
│   └── src/database/
│       ├── connection.js (Conexão com banco)
│       ├── init.js (Criação de tabelas)
│       └── queries.js (Operações CRUD)
│
└── .env.local (Configurações locais - NÃO VERSIONADO)
```

---

## 📊 TABELAS NO BANCO DE DADOS (data/inspec360.db)

### 1. **USUÁRIOS** (users)
Armazena: Administradores, Supervisores e Técnicos
```
- id, name, email, password, role, status, lastLogin, avatar, phone, createdAt
```

### 2. **ESTRUTURAS** (structures)
Armazena: Torres e estruturas de transmissão
```
- id, name, type, classe, coordenadas, progressiva, deflexão, altitude
- voltage, cadeia de condutores, para-raios, etc.
```

### 3. **COMPONENTES (REGRAS)** (componentRules)
Armazena: Tipos de componentes a inspecionar
```
- isoladores, ferragens, cadeias, para-raios, condutores, estrutura
```

### 4. **ORDENS DE SERVIÇO** (serviceOrders)
Armazena: Ordens de inspeção e execução
```
- id, type, structureId, supervisorId, technicianId, status, priority, dates
```

### 5. **INSPEÇÕES** (inspectionRecords)
Armazena: Registro de inspeções realizadas
```
- id, orderId, estruturaId, tecnicoId, dataHoraAbertura, dataHoraFim, status
```

### 6. **COMPONENTES INSPECIONADOS** (componentInspections)
Armazena: Status de cada componente em uma inspeção
```
- id, inspectionId, componentId, status (ok/anomalia/pendente), notes
```

### 7. **ANOMALIAS** (anomalies)
Armazena: Problemas encontrados durante inspeção
```
- id, anomalyName, severity (baixa/média/alta/crítica), phase, observation
```

### 8. **FOTOS** (inspectionPhotos)
Armazena: Referências às fotos de inspeção
```
- id, inspectionId, anomalyId, filePath, storagePath, caption, timestamp
```

### 9. **HISTÓRICO DE PAUSAS** (pauseHistory)
Armazena: Quando e por que uma inspeção foi pausada
```
- id, inspectionId, pausedAt, resumedAt, motivo, userId, userName
```

### 10. **EXECUÇÕES** (executionRecords)
Armazena: Registro de execuções de serviço
```
- id, orderId, estruturaId, tecnicoId, status, observações
```

---

## 💾 TIPOS DE ARMAZENAMENTO

### Banco de Dados (Dados Estruturados)
**Arquivo**: `c:\INPEC360 V2\backend\data\inspec360.db`
- **Tipo**: SQLite (em arquivo local)
- **Tamanho**: Atual = 96 KB (cresce com dados)
- **Persistência**: ✅ Entre reinicializações
- **Backup**: Copiar arquivo `inspec360.db`

**O QUE ARMAZENA**:
- ✅ Todos os usuários e credenciais
- ✅ Todas as estruturas cadastradas
- ✅ Todas as ordens de serviço
- ✅ TODAS as inspeções (com dados completos)
- ✅ TODAS as anomalias detectadas
- ✅ Histórico de pausas
- ✅ Validações e regras de componentes

### Armazenamento de Mídia (Fotos)
**Pasta**: `c:\INPEC360 V2\public\images\inspections\`
- **Tipo**: Arquivos JPG/PNG
- **Organização**: Por data ou estrutura
- **Referência no BD**: Caminho salvo na tabela `inspectionPhotos`
- **Persistência**: ✅ Em disco

### Configurações (Environment)
**Arquivo**: `c:\INPEC360 V2\.env.local`
- **Uso**: Variáveis de ambiente
- **NÃO versionado**: Dados locais/sensíveis

---

## 🔍 COMO VALIDAR ONDE ESTÃO OS DADOS

### 1. Verificar Banco de Dados
```bash
# Existe?
Test-Path "c:\INPEC360 V2\backend\data\inspec360.db"

# Tamanho?
Get-Item "c:\INPEC360 V2\backend\data\inspec360.db" | Select-Object Length

# Última modificação?
Get-Item "c:\INPEC360 V2\backend\data\inspec360.db" | Select-Object LastWriteTime
```

### 2. Listar Usuários no Banco
```bash
curl http://localhost:3000/api/users
```

### 3. Listar Estruturas
```bash
curl http://localhost:3000/api/structures
```

### 4. Listar Componentes
```bash
curl http://localhost:3000/api/components
```

### 5. Listar Fotos de Inspeção
```bash
curl http://localhost:3000/api/photos
```

---

## 🛡️ BACKUP E RESTAURAÇÃO

### Fazer Backup
1. Copiar arquivo: `c:\INPEC360 V2\backend\data\inspec360.db`
2. Copiar pasta: `c:\INPEC360 V2\public\images\inspections\`
3. Copiar arquivo: `c:\INPEC360 V2\.env.local`

### Restaurar Backup
1. Parar o sistema (fechar backend e frontend)
2. Restaurar arquivo `inspec360.db` em `backend/data/`
3. Restaurar pasta `public/images/inspections/`
4. Restaurar arquivo `.env.local`
5. Reiniciar sistema

---

## ⚠️ PONTOS IMPORTANTES

- ✅ **Todos os dados são salvos automaticamente** no arquivo do banco de dados
- ✅ **Dados persistem** mesmo após fechar e reabrir o sistema
- ✅ **Fotos são referenciadas** no banco, armazenadas em disco
- ✅ **Validações estão no backend** (backend/src/database/queries.js)
- ✅ **Ordens de serviço são rastreadas** completamente
- ✅ **Histórico completo mantido** (pausas, alterações, etc)

---

## 📱 ACESSAR OS DADOS

**Via Browser (Frontend)**:
- http://localhost:5173

**Via API (Backend)**:
- Usuários: GET http://localhost:3000/api/users
- Estruturas: GET http://localhost:3000/api/structures
- Ordens: GET http://localhost:3000/api/service-orders
- Inspeções: GET http://localhost:3000/api/inspections
- Anomalias: GET http://localhost:3000/api/inspections/:id/anomalies
- Fotos: GET http://localhost:3000/api/photos
- Componentes: GET http://localhost:3000/api/components

---

## 🔐 SEGURANÇA DOS DADOS

- Banco SQLite local (não exposto na internet)
- Credenciais salvas em `.env.local` (não versionado)
- Acesso apenas via API do backend
- Senhas armazenadas (note: em produção usar bcrypt)

---

**Última Atualização**: 15 de maio de 2026
