# 🎯 GUIA RÁPIDO - Primeiros Passos

## ⏱️ 10 Segundos para Rodar o Sistema (Forma Mais Rápida!)

### ⚡ Clique Duplo = Sistema Rodando

```
C:\INPEC360 V2\start-inspec360.vbs
```

Clique duplo neste arquivo e pronto!
- Backend inicia automaticamente
- Frontend inicia automaticamente
- Navegador abre automaticamente
- Sistema pronto para usar ✅

**Tempo total: ~10 segundos**

---

## Alternativamente: Setup Completo (5 minutos)

### 1️⃣ Verificar Node.js (1 minuto)

Abra Terminal/PowerShell e execute:

```bash
node --version
npm --version
```

Se não aparecer versão, **baixe Node.js v18+** em: https://nodejs.org/

### 2️⃣ Setup Automático (3 minutos)

#### Windows
Clique 2x em `setup.bat` na pasta raiz

**Ou** abra PowerShell na pasta e execute:
```powershell
.\setup.bat
```

#### macOS/Linux
Abra Terminal na pasta e execute:
```bash
chmod +x setup.sh
./setup.sh
```

Isso vai:
✅ Instalar dependências backend
✅ Criar banco de dados SQLite
✅ Instalar dependências frontend

### 3️⃣ Iniciar Sistema (2 minutos)

Abra **2 terminais diferentes**:

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Quando vir:
```
🚀 INSPEC360 v2.2 - Backend Iniciado
📡 Server em: http://localhost:3000
```

✅ Backend está rodando!

#### Terminal 2 - Frontend
```bash
npm run dev
```

Quando vir:
```
  ➜  Local:   http://localhost:5173/
```

✅ Frontend está rodando!

---

## 🌐 Acessar o Sistema

Abra navegador em: **http://localhost:5173**

---

## 🔐 Fazer Login

Escolha um usuário:

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@inspec360.com | admin123 |
| Supervisor | supervisor@inspec360.com | sup123 |
| Técnico | tecnico1@inspec360.com | tec123 |

### Recomendado para testar:
Use **supervisor@inspec360.com** / **sup123**

---

## 📱 Principais Telas

### Como Supervisor

1. **Dashboard** - Ver estruturas e ordens
2. **Criar Ordem** - Nova OS de inspeção
3. **Atribuir Técnico** - Designar para técnico
4. **Acompanhar** - Monitorar progresso

### Como Técnico

1. **Minhas Ordens** - Ordens atribuídas
2. **Iniciar Inspeção** - Começar a inspecionar
3. **Adicionar Componentes** - Selecionar componentes
4. **Tirar Fotos** - Adicionar evidências
5. **Registrar Anomalias** - Anotar problemas
6. **Pausar/Retomar** - Gerenciar inspeção

---

## ✅ Verificações Finais

### Backend está funcionando?
Abra: http://localhost:3000/api/health

Deve mostrar:
```json
{
  "status": "ok",
  "timestamp": "2026-05-07T...",
  "version": "2.2.0"
}
```

### Frontend conectou ao backend?
Abra navegador, vá em DevTools (F12)
Vá em **Console**

Deve mostrar: ✅ Backend conectado (sem erros CORS)

### Banco de dados foi criado?
Na pasta do projeto, verifique:
```
data/inspec360.db  ← Arquivo deve existir
```

---

## 🛠️ Troubleshooting Rápido

### "npm: command not found"
❌ Node.js não está instalado
✅ Baixe em: https://nodejs.org/

### Porta 3000 em uso
```bash
# Matar processo na porta 3000
# Windows PowerShell:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# macOS/Linux:
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Porta 5173 em uso
```bash
# Vite usa porta alternativa automaticamente
# Ou mude em vite.config.ts:
# server: { port: 5174 }
```

### Backend não conecta
1. Verificar se `npm run init-db` foi executado
2. Deletar `data/inspec360.db` e executar novamente
3. Verificar console backend para erros

### Fotos não salvam
```bash
# Criar pasta manualmente
mkdir -p public/images/inspections

# Linux/macOS - permissões
chmod 777 public/images/inspections
```

---

## 🎬 Teste Rápido

### 1. Fazer Login
- Email: `supervisor@inspec360.com`
- Senha: `sup123`

### 2. Criar Ordem de Serviço
Menu → Ordens
Botão "+ Nova Ordem"
Preencha: Estrutura, Técnico
Clique "Criar"

### 3. Iniciar Inspeção (como Técnico)
Logout
Login com: `tecnico1@inspec360.com` / `tec123`
Menu → Minhas Ordens
Clique na ordem criada
Botão "Iniciar Inspeção"

### 4. Adicionar Componente
Selecione um componente (ex: "Isoladores")
Clique "Próximo"

### 5. Tirar Foto
Clique "Câmera" ou "Upload"
Selecione arquivo de imagem
Clique "Salvar"

### 6. Registrar Anomalia
Clique "Adicionar Anomalia"
Selecione problema (ex: "Trinca")
Defina severidade (ex: "Alta")
Clique "Salvar"

### 7. Finalizar Inspeção
Botão "Finalizar Inspeção"
✅ Inspeção concluída!

---

## 💡 Dicas

### Terminal ao lado (Produtividade)
```
Terminal 1    |    Terminal 2
              |
Backend       |    Frontend
npm run dev   |    npm run dev
              |
:3000         |    :5173
```

### Recarregar dados
Se dados não aparecem, pressione:
- Frontend: `F5`
- Backend: `Ctrl+C` e `npm run dev` novamente

### Ver logs de sincronização
DevTools → Console (F12)
Procure por mensagens: "✅ Backend conectado"

### Resetar banco de dados
```bash
# Deletar banco
rm data/inspec360.db  # ou delete no Windows

# Recriar
cd backend
npm run init-db
```

---

## 📊 O Que Há no Banco de Dados

Ao iniciar, o banco tem:

✅ **3 Usuários:**
- 1 Admin
- 1 Supervisor  
- 1 Técnico

✅ **6 Componentes Padrão:**
- Isoladores
- Ferragens
- Cadeias
- Para-raios
- Condutores
- Estrutura

✅ **Pronto para:**
- Adicionar estruturas
- Criar ordens
- Realizar inspeções

---

## 🚀 Próximo Passo

Depois de rodar o sistema:

1. Explore as funcionalidades
2. Veja [EXAMPLES.tsx](EXAMPLES.tsx) para código
3. Consulte [MIGRATION.md](MIGRATION.md) para integrar
4. Leia [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) para banco

---

## 📞 Precisa de Ajuda?

### Erros no Backend?
→ Veja [backend/README.md](backend/README.md)

### Erros no Frontend?
→ Veja DevTools (F12) → Console

### Como integrar em componente?
→ Veja [EXAMPLES.tsx](EXAMPLES.tsx)

### Como funciona banco?
→ Veja [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

## ⏰ Resumo Tempo

| Passo | Tempo |
|-------|-------|
| Verificar Node.js | 1 min |
| Executar setup | 3 min |
| Iniciar backend | 30 seg |
| Iniciar frontend | 30 seg |
| **Total** | **~5 min** |

---

## ✨ Você Está Pronto!

```
✅ Backend rodando em :3000
✅ Frontend rodando em :5173
✅ Banco de dados criado
✅ 3 usuários pré-carregados
✅ 6 componentes disponíveis

🚀 Sistema INSPEC360 v2.2 OPERACIONAL
```

**Agora é só começar a usar!** 🎉

---

**Versão:** 2.2.0 | **Data:** 07/05/2026
