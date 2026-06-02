# 🧹 Limpeza de Dados Simulados - INSPEC360 v2.2.10

> ✅ **Nova feature**: Endpoint HTTP para limpeza de dados com segurança

## 📋 Opções de Limpeza

### ✅ Opção 1: Via HTTP (Recomendado - Simples)

**URL:**
```
POST https://seu-deploy.onrender.com/api/admin/clean-data
```

**Body JSON:**
```json
{
  "secret": "inspec360-admin-2026"
}
```

**Via cURL:**
```bash
curl -X POST https://seu-deploy.onrender.com/api/admin/clean-data \
  -H "Content-Type: application/json" \
  -d '{"secret":"inspec360-admin-2026"}'
```

**Via Python:**
```python
import requests

response = requests.post(
    'https://seu-deploy.onrender.com/api/admin/clean-data',
    json={'secret': 'inspec360-admin-2026'}
)
print(response.json())
```

**Via Postman:**
1. POST request
2. URL: `https://seu-deploy.onrender.com/api/admin/clean-data`
3. Tab "Body" → Raw → JSON
4. Colar: `{"secret":"inspec360-admin-2026"}`
5. Click "Send"

---

### ✅ Opção 2: Via Script Node.js (Local)

**Pré-requisitos:**
- Node.js v20+
- DATABASE_URL configurado

**Executar:**
```bash
cd backend
npm run clean-data
```

---

### ✅ Opção 3: Via Script SQL (Manual - PostgreSQL)

**Pré-requisitos:**
- PostgreSQL psql client instalado

**Executar:**
```bash
psql -U postgres inspec360 -f backend/src/database/CLEAN_DATA.sql
```

---

### ✅ Opção 4: Via Script Python (Local)

**Pré-requisitos:**
- Python 3.7+
- psycopg2 instalado: `pip install psycopg2-binary python-dotenv`
- DATABASE_URL configurado

**Executar:**
```bash
python clean-data.py
```

---

## ✅ O que será Limpo

### ❌ DELETADO:
- ❌ Todas as inspeções e seus dados
- ❌ Todas as ordens de serviço
- ❌ Todas as estruturas
- ❌ Todas as execuções
- ❌ Todos os usuários simulados
- ❌ Todas as fotos
- ❌ Todas as anomalias
- ❌ Todos os componentes customizados
- ❌ Todo estado/sincronização

### ✅ MANTIDO:
- ✅ Estrutura de tabelas do banco
- ✅ 3 usuários de teste:
  - `ismar.santos@vale-verde.com` (técnico)
  - `jonson.santos@vale-verde.com` (supervisor)
  - `gustavo.santos@vale-verde.com` (admin)

---

## 🔐 Segurança

### Chave de Admin
- **Default**: `inspec360-admin-2026`
- **Produção**: Configure via variável `ADMIN_SECRET` no Render
  
Para mudar a chave no Render:
1. Dashboard do Render → Settings
2. Add Environment Variable: `ADMIN_SECRET=sua-chave-secreta`
3. Redeploy

---

## ✅ Resultado Esperado

```json
{
  "success": true,
  "message": "Limpeza de dados concluída com sucesso!",
  "stats": {
    "users": 3,
    "structures": 0,
    "componentRules": 0,
    "serviceOrders": 0,
    "inspectionRecords": 0,
    "componentInspections": 0,
    "anomalies": 0,
    "photos": 0,
    "executions": 0,
    "pauses": 0,
    "state": 0
  },
  "users": [
    {
      "id": "uuid-1",
      "name": "Ismar Santos",
      "email": "ismar.santos@vale-verde.com",
      "role": "tecnico"
    },
    {
      "id": "uuid-2",
      "name": "Jonson Santos",
      "email": "jonson.santos@vale-verde.com",
      "role": "supervisor"
    },
    {
      "id": "uuid-3",
      "name": "Gustavo Santos",
      "email": "gustavo.santos@vale-verde.com",
      "role": "superadm"
    }
  ],
  "timestamp": "2026-06-02T16:30:00.000Z"
}
```

---

## 🐛 Troubleshooting

### Erro: "Chave de administrador inválida"
- Verifique se a chave está correta
- Default: `inspec360-admin-2026`
- Se em produção, verifique variável `ADMIN_SECRET` no Render

### Erro: "HTTP 500"
- Verifique database connection
- Acesse `/api/diagnostics/connection` para testar
- Verifique logs do Render

### Dados não foram deletados
- Verifique response JSON
- Confira que status é `"success": true`
- Verifique stats (devem ser 0, menos usuários)

---

## 📝 Checklist Pós-Limpeza

- [ ] Response foi `"success": true`
- [ ] Stats mostram 0 estruturas
- [ ] Stats mostram 0 ordens de serviço
- [ ] Apenas 3 usuários mantidos
- [ ] Login funciona com usuários de teste
- [ ] Banco pronto para dados reais

---

## ⚠️ AVISO

⚠️ **Esta operação é IRREVERSÍVEL!**
- Faça backup do banco antes de limpar
- Confirme que quer mesmo deletar TODOS os dados simulados
- Não há undo/rollback automático

---

## 🔗 Arquivos Relacionados

- `/backend/src/routes/admin.js` - Rota de limpeza
- `/backend/src/database/clean-simulated-data.js` - Script Node.js
- `/backend/src/database/CLEAN_DATA.sql` - Script SQL
- `/clean-data.py` - Script Python
- `/backend/package.json` - Comando `npm run clean-data`

---

## 💡 Quando Usar

1. **Desenvolvimento**: Limpar dados simulados antes de testes reais
2. **QA**: Prepare banco limpo para testes
3. **Produção**: Migração para dados reais após prototipagem
4. **Demo**: Limpar dados antigas entre demonstrações

---

## 🎯 Próximos Passos

Após limpeza:
1. Sistema está pronto para dados REAIS
2. Usuários podem criar estruturas/inspeções
3. Dados novos serão armazenados normalmente
4. Sincronização continua funcionando

Desfrutar de um banco limpo e organizado! 🎉
