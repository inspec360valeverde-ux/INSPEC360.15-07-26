# 💾 Sistema de Backup e Exportação de Dados - INSPEC360

## 📋 Visão Geral

Sistema estratégico de backup desenvolvido em **03/06/2026** para proteger e gerenciar dados do INSPEC360 v2.1.

**Commit**: `b9d0100f` | **Branch**: main

---

## 🎯 Características Principais

### 1. **Exportação de Dados**
Baixe dados em diferentes formatos para análise segura:

| Formato | Conteúdo | Uso |
|---------|----------|-----|
| **JSON** | Dados completos do sistema | Backup completo, importação |
| **CSV (Estruturas)** | Lista de torres/estruturas | Excel, análise, relatórios |
| **CSV (Ordens)** | Todas as ordens de serviço | Planejamento, rastreamento |

### 2. **Backups Automáticos**
- ✅ Executa automaticamente a cada **1 hora**
- ✅ Armazenado em **localStorage** (até 10 backups)
- ✅ Cada backup inclui: timestamp, tamanho, hash de integridade
- ✅ Histórico completo de backups

### 3. **Restauração de Dados**
- ✅ Recuperar dados de qualquer backup anterior
- ✅ Importar arquivos JSON de backup externo
- ✅ Validação automática de integridade
- ✅ Recarregamento automático após restauração

---

## 🗂️ Arquitetura Técnica

### Arquivos Criados

#### 1. **src/utils/backupManager.ts**
Núcleo do sistema de backup com funções:

```typescript
// Exportação
exportDataAsJSON(data)        // JSON completo
exportStructuresAsCSV(data)   // CSV de estruturas
exportServiceOrdersAsCSV(data) // CSV de ordens

// Backup local
createBackupInStorage(data)   // Cria novo backup
getBackupsList()              // Lista todos os backups
restoreBackup(timestamp)      // Restaura específico
deleteBackup(timestamp)       // Deleta backup

// Importação
importDataFromFile(file)      // Importa arquivo JSON

// Utilitários
downloadFile()                // Faz download do arquivo
formatFileSize()              // Formata tamanho
```

#### 2. **src/app/components/BackupPanel.tsx**
Interface visual com 3 abas:

- **📥 Exportar**: Baixa dados em JSON/CSV
- **💾 Backups**: Cria e gerencia backups locais
- **🔄 Restaurar**: Importa dados de arquivo

#### 3. **src/hooks/useAutoBackup.ts**
Hook para automação de backups:

```typescript
useAutoBackup()  // Ativa na montagem do componente
```

---

## 🚀 Como Usar

### Para SuperAdmin

#### Acessar o Painel:
1. Login como **Super Admin**
2. Clique no botão **"Backup"** no header
   - OU acesse a aba **"Backup"** nos tabs

#### Exportar Dados:
1. Vá para aba **"📥 Exportar"**
2. Escolha um dos botões:
   - **📥 Exportar JSON** → Backup completo
   - **📊 Exportar CSV** → Estruturas
   - **📊 Exportar CSV** → Ordens
3. Arquivo é baixado para seu dispositivo

#### Criar Backup:
1. Vá para aba **"💾 Backups"**
2. Clique **"💾 Criar Novo Backup Agora"**
3. Apareçerá na lista com timestamp

#### Restaurar Dados:
1. Opção A - De um backup local:
   - Aba **"💾 Backups"**
   - Clique **"🔄 Restaurar"** no backup desejado
   - Confirme a ação

2. Opção B - De arquivo externo:
   - Aba **"🔄 Restaurar"**
   - Clique **"📁 Selecionar Arquivo JSON"**
   - Selecione arquivo .json baixado anteriormente

---

## 📊 Armazenamento de Dados

### LocalStorage
- **Chave**: `inspec360_backup_<TIMESTAMP>`
- **Limite**: ~5-10 MB (dependendo do navegador)
- **Max Backups**: 10 (antigos são deletados automaticamente)
- **Duração**: Persiste até limpeza de cache/dados

### Metadados
- **Chave**: `inspec360_backup_metadata`
- **Conteúdo**: Lista de backups com info:
  - timestamp (ISO 8601)
  - dateHuman (formato PT-BR)
  - dataSize (bytes)
  - hash (para integridade)

---

## ⚙️ Integração

### No SuperAdmApp
```typescript
import { useAutoBackup } from '@/hooks/useAutoBackup';
import { BackupPanel } from './BackupPanel';

export function SuperAdmApp(...) {
  // Ativa backups automáticos
  useAutoBackup();
  
  // Controla abertura do painel
  const [showBackupPanel, setShowBackupPanel] = useState(false);
  
  // Modal do painel
  {showBackupPanel && <BackupPanel onClose={() => setShowBackupPanel(false)} />}
}
```

---

## 🔒 Segurança e Boas Práticas

### ✅ Implementado:
- Hash SHA para validação de integridade
- Limpeza automática de backups antigos
- Limite de armazenamento para não sobrecarregar localStorage
- Validação de arquivo importado

### ⚠️ Recomendações:
1. **Download regularmente**: Baixe backups JSON para armazenamento externo (USB, cloud)
2. **Verifique periodicamente**: Teste restauração ocasionalmente
3. **Monitore espaço**: Verifique tamanho do localStorage
4. **Backup antes de mudanças**: Crie backup antes de alterações críticas

---

## 📈 Estratégia de Backup Recomendada

### **Diário**:
- Backups automáticos a cada 1 hora (já implementado)

### **Semanal**:
- Download manual de JSON (sexta-feira)
- Armazenar em pasta nomeada por semana

### **Mensal**:
- Cópia de segurança em USB/Cloud externo
- Teste de restauração de backup antigo

### **Antes de Mudanças**:
- Criar backup manualmente antes de:
  - Atualizações do sistema
  - Alterações em dados críticos
  - Limpeza de dados

---

## 🐛 Troubleshooting

### Problema: "Espaço insuficiente para backup"
**Solução**: Delete backups antigos da aba "Backups" ou limpe cache do navegador

### Problema: Arquivo de importação "inválido ou corrompido"
**Solução**: Certifique-se que é um arquivo JSON válido exportado pelo INSPEC360

### Problema: Restauração não funciona
**Solução**: Tente recarregar a página manualmente após restaurar

### Problema: Backups automáticos não aparecem
**Solução**: Verifique se o localStorage está habilitado nas configurações do navegador

---

## 📝 Próximas Melhorias (Sugestões)

- [ ] Compressão GZIP para backups (economizar espaço)
- [ ] Criptografia de dados sensíveis
- [ ] Sincronização de backups com servidor/cloud
- [ ] Agendamento customizável de backups
- [ ] Validação de dados antes de restaurar
- [ ] Relatórios de integridade de dados
- [ ] Export em formatos adicionais (Excel, PDF)

---

## 📞 Suporte

Para dúvidas ou problemas com o sistema de backup, consulte:
- Documentação técnica em `src/utils/backupManager.ts`
- Componente visual em `src/app/components/BackupPanel.tsx`
- Hook de automação em `src/hooks/useAutoBackup.ts`

---

**Última Atualização**: 03/06/2026 | **Status**: ✅ Produção
