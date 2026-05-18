# 📸 Georeferenciamento de Fotos - Guia Prático

## ✅ O que foi implementado

### 1. **Captura de GPS Automática**
- Captura latitude, longitude e precisão da localização
- Armazenada no banco de dados (campo `accuracy`)
- Funciona em desktop e mobile

### 2. **Data/Hora Automática**
- Registra timestamp completo da foto
- Formato: `YYYYMMDD_HHMMSS`
- Armazenado em `timestamp` e na legenda

### 3. **Organização de Pastas Estratégica**
Estrutura de armazenamento:
```
public/images/inspections/
└── {inspectionId}/
    ├── {ComponentName}/
    │   └── {AnomalyName}/
    │       └── 20260518_143025_isoladores_trinca_uuid.jpg
    ├── {AnotherComponent}/
    │   └── 20260518_143100_ferragens_uuid.jpg
    └── geral/
        └── 20260518_140000_geral_uuid.jpg
```

### 4. **Legenda Estratégica para Relatórios**
Exemplo de nome de arquivo + caption:
- **Nome**: `20260518_143025_isoladores_trinca_uuid.jpg`
- **Caption**: `Isoladores - Trinca @ 18/05/2026 14:30:25 [GPS: -23.55089, -46.63331]`

Aparecem assim nos relatórios:
- ✅ Data/hora clara
- ✅ Componente identificado
- ✅ Anomalia específica
- ✅ Coordenadas para localizar no mapa

---

## 🎯 Como Usar (Técnico no Campo)

### **1. Fluxo de Inspeção**

1. Abrir app INSPEC360
2. Iniciar inspeção de uma ordem de serviço
3. Para cada componente, clicar em **"Registrar Evidências Fotográficas"**

```
┌─────────────────────────────────────────┐
│  Registrar Evidências Fotográficas      │
├─────────────────────────────────────────┤
│  [Adicionar Foto]  [GPS]  [GPS OK] ✓    │
├─────────────────────────────────────────┤
│  GPS: -23.55089, -46.63331              │
│  Precisão: ±8.5m                        │
├─────────────────────────────────────────┤
│  Fotos (2) • GPS Registrado             │
│  [thumb1] [thumb2]                      │
└─────────────────────────────────────────┘
```

### **2. Capturar GPS (Obrigatório para Relatório)**

**Opção A: Automático** (recomendado)
- Clicar botão [GPS]
- Aguardar 3-5 segundos
- Deve aparecer: `GPS OK ✓` (verde)
- Se der erro:
  - Ativar localização no celular
  - Sair de dentro de prédios
  - Tentar novamente

**Opção B: Sem GPS**
- Fotos serão enviadas mesmo sem GPS
- Caption será: `Isoladores @ 18/05/2026 14:30:25 [Sem GPS]`

### **3. Capturar Fotos**

**Opção 1: Câmera do dispositivo** (melhor qualidade)
```
1. Clicar [Adicionar Foto]
2. Tomar a foto
3. Preview aparece
4. Clicar [Enviar Foto]
```

**Opção 2: Galeria/Arquivo**
```
1. Clicar [Adicionar Foto]
2. Selecionar arquivo existente
3. Preview aparece
4. Clicar [Enviar Foto]
```

### **4. Exemplo Real: Inspeção com Anomalia**

```
📱 Técnico Silva está inspecionando Isoladores
├─ Estrutura: Torre LT-123
├─ Componente: Isoladores
├─ Anomalia Encontrada: Trinca na porcelana
│
├─ [Capturar GPS] ✓ GPS: -23.55089, -46.63331
├─ [Adicionar Foto 1] → foto_antes.jpg
├─ [Adicionar Foto 2] → foto_zoom.jpg
│
└─ Resultado no banco:
   - filePath: /images/inspections/ord_456/Isoladores/Trinca/20260518_143025_isoladores_trinca_uuid.jpg
   - caption: "Isoladores - Trinca @ 18/05/2026 14:30:25 [GPS: -23.55089, -46.63331]"
   - latitude: -23.55089
   - longitude: -46.63331
   - accuracy: 8.5m
```

---

## 📊 Como Aparecem nos Relatórios (Supervisor)

### **Visualização 1: Relatório de Inspeção**

```
┌─────────────────────────────────────────────────────┐
│  INSPEÇÃO - Isoladores                              │
├─────────────────────────────────────────────────────┤
│  Anomalia: Trinca na porcelana (CRÍTICA)            │
│  Data/Hora: 18/05/2026 14:30:25                     │
│  GPS: -23.55089, -46.63331 (±8.5m)                  │
│                                                     │
│  FOTOS:                                             │
│  [Preview 1] "Isoladores - Trinca"                  │
│  [Preview 2] "Isoladores - Detalhe"                 │
│                                                     │
│  📍 Ver no mapa     📥 Baixar ZIP                   │
└─────────────────────────────────────────────────────┘
```

### **Visualização 2: Mapa com Fotos**

```
🗺️ MAPA INTERATIVO
├─ Torre LT-123 @ -23.55089, -46.63331
│  ├─ Isoladores: 2 fotos 🖼️
│  ├─ Ferragens: 1 foto 🖼️
│  └─ Condutores: 3 fotos 🖼️
│
└─ Clicar na torre → lista todas as fotos com GPS
```

### **Visualização 3: Organização de Pastas**

No servidor/storage (se exportado):
```
relatorio_LT-123_20260518.zip
├── inspeção_456/
│   ├── Isoladores/
│   │   ├── Trinca/
│   │   │   ├── 20260518_143025_isoladores_trinca_uuid1.jpg
│   │   │   └── 20260518_143026_isoladores_trinca_uuid2.jpg
│   │   └── Queimadura/
│   │       └── 20260518_143100_isoladores_queimadura_uuid3.jpg
│   │
│   ├── Ferragens/
│   │   ├── Corrosão/
│   │   │   └── 20260518_143150_ferragens_corrosao_uuid4.jpg
│   │   └── Deformação/
│   │       └── 20260518_143200_ferragens_deformacao_uuid5.jpg
│   │
│   └── geral/
│       ├── 20260518_140000_geral_uuid6.jpg
│       ├── 20260518_140030_geral_uuid7.jpg
│       └── 20260518_140100_geral_uuid8.jpg
│
└── metadados.json (coordenadas de todas as fotos)
```

---

## 🔧 Banco de Dados - Nova Estrutura

### Tabela: `inspectionPhotos`

| Campo | Tipo | Exemplo | Descrição |
|-------|------|---------|-----------|
| `id` | TEXT | `uuid-xxx` | ID único |
| `inspectionId` | TEXT | `insp_456` | Qual inspeção |
| `componentId` | TEXT | `isoladores` | Qual componente |
| `componentName` | TEXT | `Isoladores` | Nome legível |
| `anomalyId` | TEXT | `anom_789` | Qual anomalia |
| `anomalyName` | TEXT | `Trinca` | Nome da anomalia |
| `filePath` | TEXT | `/images/inspections/...` | Caminho público |
| `storagePath` | TEXT | `inspections/456/Isoladores/Trinca` | Pasta organizada |
| `caption` | TEXT | `Isoladores - Trinca @ 18/05/2026...` | Legenda estratégica |
| `timestamp` | TEXT | `2026-05-18T14:30:25Z` | Quando foi tirada |
| `latitude` | REAL | `-23.55089` | Coordenada GPS |
| `longitude` | REAL | `-46.63331` | Coordenada GPS |
| `accuracy` | REAL | `8.5` | Precisão em metros |

**Exemplo de INSERT:**
```sql
INSERT INTO inspectionPhotos VALUES (
  'photo_uuid_001',
  'insp_456',
  'isoladores',
  'Isoladores',
  'anom_789',
  'Trinca',
  '/images/inspections/insp_456/Isoladores/Trinca/20260518_143025_isoladores_trinca_uuid.jpg',
  'inspections/insp_456/Isoladores/Trinca',
  'Isoladores - Trinca @ 18/05/2026 14:30:25 [GPS: -23.55089, -46.63331]',
  '2026-05-18T14:30:25Z',
  -23.55089,
  -46.63331,
  8.5
);
```

---

## 🛠️ Troubleshooting

### ❌ "GPS não funciona"

**Possíveis causas:**
- Localização desativada no celular
- Sem sinal/WiFi
- Dentro de prédio

**Solução:**
1. Ativar Localização nas configurações do celular
2. Sair para um local aberto
3. Esperar 5-10 segundos
4. Tentar novamente

### ❌ "Foto não foi salva"

**Possíveis causas:**
- Sem internet (offline)
- Arquivo muito grande (>50MB)
- Formato inválido (não é JPEG/PNG)

**Solução:**
1. Verificar conexão
2. Redimensionar foto
3. Usar JPEG ou PNG

### ❌ "Fotos aparecem desorganizadas no relatório"

**Possível causa:**
- Anomalia não foi registrada ao capturar foto

**Solução:**
1. Registrar anomalia primeiro
2. Depois capturar fotos
3. Sistema associará automaticamente

---

## 📱 Permissões Necessárias (Mobile)

**Android:**
- ✅ Câmera
- ✅ Localização (GPS)
- ✅ Armazenamento (salvar fotos temporárias)

**iOS:**
- ✅ Câmera
- ✅ Localização
- ✅ Biblioteca de Fotos

**Como ativar:**
```
Android: Configurações → Aplicativos → INSPEC360 → Permissões
iOS: Configurações → INSPEC360 → Câmera + Localização
```

---

## 🎯 Fluxo Completo: Do Campo ao Relatório

```
1️⃣ TÉCNICO NO CAMPO
   ├─ Inicia inspeção
   ├─ [GPS] Captura coordenadas
   ├─ [Adicionar Foto] Tira fotos
   └─ Salva inspeção (fotos + GPS + data/hora)

2️⃣ FOTOS ORGANIZADAS NO SERVIDOR
   inspections/
   └── insp_456/
       └── Isoladores/
           └── Trinca/
               └── 20260518_143025_isoladores_trinca_uuid.jpg

3️⃣ BANCO DE DADOS ATUALIZADO
   inspectionPhotos table:
   ├─ filePath: /images/inspections/...
   ├─ latitude: -23.55089
   ├─ longitude: -46.63331
   ├─ timestamp: 2026-05-18T14:30:25Z
   └─ caption: "Isoladores - Trinca @ 18/05/2026 14:30:25 [GPS: -23.55089, -46.63331]"

4️⃣ SUPERVISOR VÊ RELATÓRIO
   ├─ 📸 Fotos organizadas por componente
   ├─ 📍 Mapa com coordenadas
   ├─ 📅 Data/hora exata
   └─ 📥 Download de relatório com estrutura clara
```

---

## ✨ Benefícios Práticos

| Benefício | Como Funciona |
|-----------|---------------|
| **Localização precisa** | GPS de ±8.5m auxilia no mapeamento de anomalias |
| **Auditoria completa** | Data/hora automática em cada foto |
| **Relatórios organizados** | Pastas por componente → anomalia |
| **Fácil navegação** | Supervisor encontra fotos rapidamente |
| **Integração com mapas** | Fotos plotadas no mapa de linha |
| **Backup estruturado** | Zip download com pasta organizada |

---

## 🔐 Segurança & Privacidade

- ✅ GPS só funciona com permissão do usuário
- ✅ Dados de localização salvos apenas com foto
- ✅ Sem rastreamento em tempo real
- ✅ Dados locais (não enviados a terceiros)
- ✅ LGPD compatível

---

## 📞 Suporte

Caso tenha dúvidas, entre em contato com o time de desenvolvimento!
