# INSPEC360 v2.2 — Documentação de Bases de Dados

> Gerado automaticamente em 06/05/2026  
> Sistema: INSPEC360 — Mineração Vale Verde  
> Versão: 2.2.0

---

## Visão Geral da Arquitetura

O sistema possui **5 bancos de dados** principais, todos interligados por chaves estrangeiras (FK). Em produção, devem ser implementados em um banco relacional (PostgreSQL recomendado via Supabase) ou NoSQL (Firebase Firestore).

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌────────────────┐
│   USUÁRIOS  │────▶│  ESTRUTURAS  │────▶│   INSPEÇÕES    │────▶│   EXECUÇÕES    │
│  (users)    │     │ (structures) │     │(inspectionRec.)│     │(executionRec.) │
└─────────────┘     └──────────────┘     └────────────────┘     └────────────────┘
                                                  ▲
                                                  │ validação
                                         ┌────────────────┐
                                         │  COMPONENTES   │
                                         │(componentRules)│
                                         └────────────────┘
```

---

## 1. Banco de Usuários (`users`)

**Descrição:** Todos os usuários do sistema com suas credenciais, tipo de acesso e situação.

| Campo       | Tipo     | Obrigatório | Descrição                                  |
|-------------|----------|-------------|---------------------------------------------|
| id          | string   | ✓           | Identificador único (UUID ou slug)          |
| name        | string   | ✓           | Nome completo do usuário                    |
| email       | string   | ✓           | E-mail usado para login (único)             |
| password    | string   | ✓           | Senha (deve ser hash bcrypt em produção)    |
| role        | enum     | ✓           | Tipo de acesso: `tecnico` / `supervisor` / `superadm` |
| status      | enum     | ✓           | Situação: `active` / `inactive`             |
| lastLogin   | string   | ✓           | Data/hora do último acesso                  |
| avatar      | string   |             | URL da foto de perfil                       |
| phone       | string   |             | Telefone de contato                         |
| createdAt   | datetime |             | Data de criação do cadastro                 |

**Relacionamentos:**
- `id` → referenciado por `structures.createdBy`
- `id` → referenciado por `inspectionRecords.tecnicoId`
- `id` → referenciado por `inspectionRecords.supervisorId`
- `id` → referenciado por `executionRecords.tecnicoId`
- `id` → referenciado por `executionRecords.supervisorId`
- `id` → referenciado por `serviceOrders.technicianId` / `supervisorId`

---

## 2. Banco de Estruturas (`structures`)

**Descrição:** Todas as torres e estruturas da linha de transmissão com dados técnicos completos.

| Campo            | Tipo     | Obrigatório | Descrição                                      |
|------------------|----------|-------------|------------------------------------------------|
| id               | string   | ✓           | Identificador único                            |
| name             | string   | ✓           | Nome da estrutura (ex: Torre 001)              |
| type             | enum     | ✓           | Tipo: Suspensão / Ancoragem / Transposição / Terminal / Ângulo / Estaiada |
| classe           | string   |             | Classe da estrutura (ex: MT2, AT3)             |
| **coordX**       | number   | ✓           | **Coordenada X (Longitude decimal)**           |
| **coordY**       | number   | ✓           | **Coordenada Y (Latitude decimal)**            |
| progressiva      | number   | ✓           | Progressiva em metros (distância na LT)        |
| deflexao         | number   |             | Ângulo de deflexão em graus                    |
| **alturaUtil**   | number   |             | **Altura útil (m)**                            |
| **vanFrente**    | number   |             | **Vão à frente (m)**                           |
| **cotaCentro**   | number   |             | **Cota centro (m)**                            |
| lt               | string   | ✓           | Nome da linha de transmissão                   |
| voltage          | string   | ✓           | Tensão nominal (ex: 230kV)                     |
| cadeiaCondutor   | string   |             | Tipo da cadeia de condutor                     |
| qtdCadeias       | number   |             | Quantidade de cadeias de condutor              |
| cadeiaParaRaios  | string   |             | Tipo da cadeia para-raios                      |
| qtdCadeiasPR     | number   |             | Quantidade de cadeias para-raios               |
| estruturaCritica | boolean  |             | Indica se é estrutura crítica                  |
| status           | enum     | ✓           | pendente / em-andamento / concluido / anomalia / atrasado |
| observation      | string   |             | Observações técnicas                           |
| createdBy        | FK(User) | ✓           | Usuário que criou (FK → users.id)              |
| createdAt        | datetime | ✓           | Data/hora de criação                           |

**Relacionamentos:**
- `createdBy` → `users.id`
- `id` → referenciado por `inspectionRecords.estruturaId`
- `id` → referenciado por `executionRecords.estruturaId`
- `id` → referenciado por `serviceOrders.structureId`

---

## 3. Banco de Componentes (`componentRules`)

**Descrição:** Define os componentes que são inspecionados e quais anomalias são possíveis para cada um. Este banco é o motor de validação do sistema — ao selecionar um componente numa inspeção, as anomalias disponíveis são carregadas diretamente deste banco.

| Campo       | Tipo     | Obrigatório | Descrição                                       |
|-------------|----------|-------------|-------------------------------------------------|
| id          | string   | ✓           | Identificador único (slug ex: isoladores)       |
| name        | string   | ✓           | Nome do componente (ex: Isoladores)             |
| icon        | string   |             | Emoji ou ícone visual                           |
| description | string   |             | Descrição do que será inspecionado              |
| anomalies   | string[] | ✓           | Lista de anomalias possíveis para este componente |

**Mecanismo de Validação:**
```
Técnico seleciona componente na inspeção
         ↓
Sistema carrega anomalies[] deste componente
         ↓
Técnico escolhe qual(is) anomalia(s) foram encontradas
         ↓
AnomalyEntry é salvo com referência ao componentId
```

**Relacionamentos:**
- `id` → referenciado por `inspectionRecords.components[].componentId`
- `anomalies[]` → alimenta o seletor de anomalias no fluxo de inspeção

---

## 4. Banco de Inspeções (`inspectionRecords`)

**Descrição:** Registro completo de cada inspeção realizada. Criado automaticamente quando um técnico inicia uma OS de inspeção. Cada componente inspecionado é salvo com suas respectivas anomalias.

| Campo               | Tipo              | Obrigatório | Descrição                                         |
|---------------------|-------------------|-------------|---------------------------------------------------|
| id                  | string            | ✓           | Identificador único (`insp_TIMESTAMP_RANDOM`)     |
| orderId             | FK(ServiceOrder)  | ✓           | OS que originou esta inspeção                     |
| estruturaId         | FK(Structure)     | ✓           | Estrutura inspecionada                            |
| estruturaNome       | string            | ✓           | Nome denormalizado (histórico)                    |
| supervisorId        | FK(User)          | ✓           | Supervisor que criou a OS                         |
| supervisorNome      | string            | ✓           | Nome denormalizado                                |
| tecnicoId           | FK(User)          | ✓           | Técnico que realizou a inspeção                   |
| tecnicoNome         | string            | ✓           | Nome denormalizado                                |
| dataHoraAbertura    | datetime          | ✓           | Início da inspeção (quando técnico iniciou a OS)  |
| dataHoraFim         | datetime          |             | Fim da inspeção (quando concluída)                |
| status              | enum              | ✓           | aberto / em-andamento / pausado / concluido / cancelado |
| components          | ComponentInsp[]   | ✓           | Lista de componentes inspecionados (ver abaixo)   |
| historicoPausas     | PauseHistory[]    | ✓           | Histórico de todas as pausas (ver abaixo)         |
| observacoesGerais   | string            |             | Observações gerais da inspeção                    |
| photos              | InspectionPhoto[] | ✓           | Fotos organizadas por componente/anomalia         |

### 4.1 Sub-estrutura: ComponentInspection

| Campo         | Tipo          | Descrição                                                    |
|---------------|---------------|--------------------------------------------------------------|
| componentId   | FK(Component) | Referência ao componente no banco de componentes             |
| componentName | string        | Nome denormalizado                                           |
| status        | enum          | pendente / ok / anomalia / nao-aplicavel                     |
| anomalies     | AnomalyEntry[]| Lista de anomalias encontradas (ver abaixo)                  |
| notes         | string        | Notas do técnico sobre este componente                       |
| photos        | string[]      | Referências às fotos deste componente                        |

### 4.2 Sub-estrutura: AnomalyEntry

| Campo             | Tipo    | Descrição                                         |
|-------------------|---------|---------------------------------------------------|
| id                | string  | ID único da anomalia                              |
| anomalyName       | string  | Nome (deve ser um dos valores em component.anomalies[]) |
| severity          | FK(Sev) | Severidade (FK → severities.id)                   |
| phase             | enum    | A / B / C / N / Geral                            |
| isEmenda          | boolean | É emenda?                                        |
| safetyRisk        | FK(Sev) | Risco de segurança                               |
| operationalRisk   | FK(Sev) | Risco operacional                                |
| requiresShutdown  | boolean | Requer desligamento?                             |
| isRecurrent       | boolean | Anomalia recorrente?                             |
| observation       | string  | Observação do técnico                            |
| photo             | string  | Referência à foto desta anomalia                 |

### 4.3 Sub-estrutura: PauseHistoryEntry

| Campo      | Tipo     | Descrição                          |
|------------|----------|------------------------------------|
| pausedAt   | datetime | Momento da pausa                   |
| resumedAt  | datetime | Momento da retomada (se retomou)   |
| motivo     | string   | Motivo da pausa                    |
| userId     | FK(User) | Quem pausou                        |
| userName   | string   | Nome denormalizado                 |

### 4.4 Sub-estrutura: InspectionPhoto (organização de imagens)

| Campo         | Tipo     | Descrição                                                    |
|---------------|----------|--------------------------------------------------------------|
| id            | string   | ID único da foto                                             |
| inspectionId  | string   | FK → inspectionRecords.id                                    |
| componentId   | string   | FK → ComponentRule.id (null = foto geral)                    |
| componentName | string   | Nome denormalizado                                           |
| anomalyId     | string   | FK → AnomalyEntry.id (opcional)                             |
| dataBase64    | string   | Imagem em base64 (em produção: URL do Supabase Storage)      |
| timestamp     | datetime | Quando foi tirada                                            |
| caption       | string   | Legenda                                                      |
| storagePath   | string   | **Caminho organizacional da pasta**                          |

**Organização das Pastas de Fotos:**
```
inspections/
  └── {inspectionId}/
        ├── geral/
        │     └── {photoId}.jpg          ← Fotos gerais da inspeção
        └── components/
              └── {componentId}/
                    └── {photoId}.jpg    ← Fotos do componente específico
```

**Relacionamentos:**
- `orderId` → `serviceOrders.id`
- `estruturaId` → `structures.id`
- `supervisorId` → `users.id`
- `tecnicoId` → `users.id`
- `components[].componentId` → `componentRules.id`
- `id` → referenciado por `executionRecords.inspectionId`

---

## 5. Banco de Execuções (`executionRecords`)

**Descrição:** Registro de execução de serviço. Puxa dados do banco de inspeções quando se trata de correção de anomalia identificada. Adiciona timing específico de execução (início e fim da execução em campo).

| Campo                   | Tipo               | Obrigatório | Descrição                                          |
|-------------------------|--------------------|-------------|----------------------------------------------------|
| id                      | string             | ✓           | Identificador único (`exec_TIMESTAMP_RANDOM`)      |
| orderId                 | FK(ServiceOrder)   | ✓           | OS de execução                                     |
| **inspectionId**        | FK(Inspection)?    |             | **Inspeção que originou esta execução** (quando há) |
| estruturaId             | FK(Structure)      | ✓           | Estrutura onde será executado                      |
| estruturaNome           | string             | ✓           | Nome denormalizado                                 |
| supervisorId            | FK(User)           | ✓           | Supervisor                                         |
| supervisorNome          | string             | ✓           | Nome denormalizado                                 |
| tecnicoId               | FK(User)           | ✓           | Técnico executor                                   |
| tecnicoNome             | string             | ✓           | Nome denormalizado                                 |
| componente              | string             | ✓           | Componente a ser executado/reparado                |
| anomalia                | string             | ✓           | Anomalia que motivou a execução                    |
| descricao               | string             |             | Descrição do serviço                               |
| detalhes                | string             |             | Detalhes técnicos                                  |
| prazoRegras             | string             |             | Regras de prazo                                    |
| notasSupervisor         | string             |             | Notas do supervisor                                |
| dataHoraAbertura        | datetime           | ✓           | Abertura da OS de execução                         |
| **dataHoraExecucaoInicio** | datetime        |             | **Início da execução em campo**                    |
| **dataHoraExecucaoFim**    | datetime        |             | **Fim da execução em campo**                       |
| dataHoraFim             | datetime           |             | Conclusão total da OS                              |
| status                  | enum               | ✓           | pendente / em-andamento / pausado / concluido / cancelado |
| historicoPausas         | PauseHistory[]     | ✓           | Histórico de pausas (mesma estrutura do banco de inspeções) |
| photos                  | InspectionPhoto[]  | ✓           | Fotos da execução (organizadas da mesma forma)     |
| observacoesGerais       | string             |             | Observações gerais                                 |

**Relacionamentos:**
- `orderId` → `serviceOrders.id`
- `inspectionId` → `inspectionRecords.id` *(chave fundamental de ligação entre os dois bancos)*
- `estruturaId` → `structures.id`
- `supervisorId` → `users.id`
- `tecnicoId` → `users.id`

---

## Fluxo de Dados — Como os Bancos se Conversam

```
1. SUPERVISOR cria OS de Inspeção
   → serviceOrder criado (type: 'inspecao', status: 'pendente')
   → NÃO cria InspectionRecord ainda (aguarda técnico iniciar)

2. TÉCNICO inicia a OS de Inspeção
   → serviceOrder.status → 'em-andamento'
   → InspectionRecord CRIADO automaticamente:
      - estruturaId ← serviceOrder.structureId (FK → structures)
      - tecnicoId ← userId logado (FK → users)
      - supervisorId ← serviceOrder.supervisorId (FK → users)
      - components[] ← carregados do banco de componentes (componentRules)
      - dataHoraAbertura ← now()

3. TÉCNICO preenche componentes (fluxo de inspeção)
   → Para cada componente:
      - Seleciona status (ok / anomalia / nao-aplicavel)
      - Se anomalia: seleciona anomalyName da lista do componentRule (FK)
      - Registra severity, phase, fotos, etc.
   → inspectionRecord.components[] é atualizado em tempo real (saveInspectionProgress)
   → Fotos salvas em: inspections/{inspectionId}/components/{componentId}/

4. TÉCNICO pausa
   → serviceOrder.status → 'pausado'
   → inspectionRecord.historicoPausas[] recebe nova entrada { pausedAt, motivo }

5. TÉCNICO retoma
   → serviceOrder.status → 'em-andamento'
   → última pausa recebe resumedAt = now()

6. TÉCNICO conclui
   → serviceOrder.status → 'concluido'
   → inspectionRecord.dataHoraFim = now()
   → inspectionRecord.status → 'concluido'
   → structure.status atualizado (anomalia ou concluido)

7. SUPERVISOR cria OS de Execução (para corrigir anomalia)
   → serviceOrder criado (type: 'execucao')
   → ExecutionRecord CRIADO automaticamente com dados da OS
   → executionRecord.inspectionId pode ser linkado à inspeção origem

8. TÉCNICO inicia OS de Execução
   → executionRecord.dataHoraExecucaoInicio = now()
   → executionRecord.status → 'em-andamento'

9. TÉCNICO conclui execução
   → executionRecord.dataHoraExecucaoFim = now()
   → executionRecord.dataHoraFim = now()
   → executionRecord.status → 'concluido'
```

---

## Implementação Backend (Supabase / PostgreSQL)

Para migrar de localStorage para backend real, seguir esta estrutura SQL:

```sql
-- Banco de Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('tecnico', 'supervisor', 'superadm')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  last_login TIMESTAMPTZ,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banco de Estruturas
CREATE TABLE structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  classe TEXT,
  coord_x FLOAT NOT NULL,      -- Longitude
  coord_y FLOAT NOT NULL,      -- Latitude
  progressiva FLOAT NOT NULL,
  deflexao FLOAT,
  altura_util FLOAT,
  van_frente FLOAT,
  cota_centro FLOAT,
  lt TEXT NOT NULL,
  voltage TEXT NOT NULL,
  cadeia_condutor TEXT,
  qtd_cadeias INT,
  cadeia_para_raios TEXT,
  qtd_cadeias_pr INT,
  estrutura_critica BOOLEAN DEFAULT FALSE,
  observation TEXT,
  status TEXT DEFAULT 'pendente',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banco de Componentes
CREATE TABLE component_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  anomalies JSONB NOT NULL DEFAULT '[]'  -- array de strings
);

-- Banco de Inspeções
CREATE TABLE inspection_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES service_orders(id),
  estrutura_id UUID REFERENCES structures(id),
  estrutura_nome TEXT,
  supervisor_id UUID REFERENCES users(id),
  supervisor_nome TEXT,
  tecnico_id UUID REFERENCES users(id),
  tecnico_nome TEXT,
  data_hora_abertura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_hora_fim TIMESTAMPTZ,
  status TEXT DEFAULT 'aberto',
  components JSONB NOT NULL DEFAULT '[]',      -- ComponentInspection[]
  historico_pausas JSONB NOT NULL DEFAULT '[]', -- PauseHistoryEntry[]
  observacoes_gerais TEXT
);

-- Fotos de Inspeção (bucket separado no Supabase Storage)
CREATE TABLE inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspection_records(id),
  component_id TEXT REFERENCES component_rules(id),
  anomaly_id TEXT,
  storage_path TEXT NOT NULL,
  -- Path: inspections/{inspection_id}/components/{component_id}/{photo_id}.jpg
  -- Path geral: inspections/{inspection_id}/geral/{photo_id}.jpg
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  caption TEXT
);

-- Banco de Execuções
CREATE TABLE execution_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES service_orders(id),
  inspection_id UUID REFERENCES inspection_records(id),  -- FK para inspeção origem
  estrutura_id UUID REFERENCES structures(id),
  estrutura_nome TEXT,
  supervisor_id UUID REFERENCES users(id),
  supervisor_nome TEXT,
  tecnico_id UUID REFERENCES users(id),
  tecnico_nome TEXT,
  componente TEXT NOT NULL,
  anomalia TEXT NOT NULL,
  descricao TEXT,
  detalhes TEXT,
  prazo_regras TEXT,
  notas_supervisor TEXT,
  data_hora_abertura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_hora_execucao_inicio TIMESTAMPTZ,  -- CAMPO CHAVE
  data_hora_execucao_fim TIMESTAMPTZ,     -- CAMPO CHAVE
  data_hora_fim TIMESTAMPTZ,
  status TEXT DEFAULT 'pendente',
  historico_pausas JSONB NOT NULL DEFAULT '[]',
  observacoes_gerais TEXT
);
```

---

## Organização de Fotos no Storage

Em produção com Supabase Storage:

```
Bucket: inspec360-fotos/
  └── inspections/
        └── {inspection_id}/
              ├── geral/
              │     └── {timestamp}_{random}.jpg
              └── components/
                    └── {component_id}/
                          └── {timestamp}_{anomaly_id}_{random}.jpg

Bucket: inspec360-execucoes/
  └── executions/
        └── {execution_id}/
              └── {timestamp}_{random}.jpg
```

**Vantagens dessa organização:**
- Fotos nunca se misturam entre inspeções diferentes
- Fácil exclusão em cascata (delete pasta da inspeção)
- Possibilidade de download em ZIP por inspeção
- Auditoria clara de qual foto pertence a qual componente/anomalia

---

## Resumo de Relacionamentos

| Banco          | Referencia                | Campo FK            |
|----------------|---------------------------|---------------------|
| Estruturas     | Usuários                  | createdBy → users.id |
| Inspeções      | Ordens de Serviço         | orderId → serviceOrders.id |
| Inspeções      | Estruturas                | estruturaId → structures.id |
| Inspeções      | Usuários (técnico)        | tecnicoId → users.id |
| Inspeções      | Usuários (supervisor)     | supervisorId → users.id |
| Inspeções      | Componentes (validação)   | components[].componentId → componentRules.id |
| Execuções      | Ordens de Serviço         | orderId → serviceOrders.id |
| Execuções      | **Inspeções**             | **inspectionId → inspectionRecords.id** |
| Execuções      | Estruturas                | estruturaId → structures.id |
| Execuções      | Usuários (técnico)        | tecnicoId → users.id |
| Execuções      | Usuários (supervisor)     | supervisorId → users.id |

---

*Documento gerado pelo sistema INSPEC360 v2.2 — Mineração Vale Verde*
