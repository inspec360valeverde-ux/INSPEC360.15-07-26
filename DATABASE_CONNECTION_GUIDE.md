# 🔧 Guia de Diagnóstico: Erro de Sincronização com PostgreSQL

## ❌ Problema

Ao clicar no botão de sincronização, recebe erro:
```
Erro ao sincronizar. Tente novamente.
```

E o backend retorna **HTTP 500** ao tentar salvar estado em `/api/state`.

## 🎯 Diagnóstico

### Passo 1: Verificar DATABASE_URL

O erro HTTP 500 indica que a variável de ambiente `DATABASE_URL` não está configurada ou o PostgreSQL não está respondendo.

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL
```

**Linux/macOS:**
```bash
echo $DATABASE_URL
```

### Passo 2: Executar Script de Diagnóstico

**Windows:**
```powershell
cd backend
.\diagnose.ps1
```

**Linux/macOS:**
```bash
cd backend
bash diagnose.sh
```

### Passo 3: Verificar Logs do Servidor

Se o servidor está rodando localmente:
```
npm run dev
```

Procure por mensagens como:
- ❌ `Pool não inicializado` → PostgreSQL não conectou
- ❌ `ECONNREFUSED` → Servidor PostgreSQL offline
- ❌ `password authentication failed` → Credenciais erradas

## 🔌 Configuração do PostgreSQL

### Para Desenvolvimento Local (Windows)

1. **Instalar PostgreSQL:**
   - Baixe em https://www.postgresql.org/download/windows/
   - Durante instalação, anote a senha do usuário `postgres`

2. **Criar banco de dados:**
   ```bash
   psql -U postgres
   ```
   
   Dentro do psql:
   ```sql
   CREATE DATABASE inspec360_dev;
   \q
   ```

3. **Configurar DATABASE_URL:**
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:SENHA_AQUI@localhost:5432/inspec360_dev"
   ```
   
   Substitua `SENHA_AQUI` pela senha que definiu durante a instalação.

4. **Testar conexão:**
   ```bash
   psql $env:DATABASE_URL -c "SELECT 1;"
   ```

### Para Render (Produção)

1. **No dashboard do Render:**
   - Crie um PostgreSQL Database
   - Copie a connection string
   - Cole em **Environment Variables** → `DATABASE_URL`

2. **Exemplo (NÃO use direto, use o da Render):**
   ```
   postgresql://user:password@host:5432/database
   ```

3. **Redeploy a aplicação após definir DATABASE_URL**

## 🚀 Passos para Resolver

### 1️⃣ Verificar Configuração

```powershell
# Windows
cd c:\inspec360\ v2.1
.\backend\diagnose.ps1
```

### 2️⃣ Se DATABASE_URL está vazio

Configure a variável de ambiente:

**Windows (Permanente):**
1. Pressione `Win + X` → `Sistema`
2. Vá para `Configurações Avançadas do Sistema`
3. Clique em `Variáveis de Ambiente`
4. Novo → Nome: `DATABASE_URL`
5. Valor: `postgresql://postgres:SENHA@localhost:5432/inspec360_dev`
6. OK e reinicie VS Code

**Windows (Temporário - apenas sessão atual):**
```powershell
$env:DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/inspec360_dev"
npm start
```

### 3️⃣ Se PostgreSQL está offline

**Windows:**
- Procure por "PostgreSQL" nos Serviços do Windows
- Se não está rodando, clique com botão direito → Iniciar

**Ou via terminal:**
```powershell
# Verificar status
pg_isready -h localhost
```

### 4️⃣ Testar Conexão

```bash
psql $env:DATABASE_URL -c "SELECT version();"
```

Deve retornar a versão do PostgreSQL.

### 5️⃣ Verificar Tabelas

```bash
psql $env:DATABASE_URL -c "\dt"
```

Deve listar as tabelas, incluindo a tabela `state`.

## 📋 Checklist de Verificação

- [ ] DATABASE_URL está configurada (`echo $env:DATABASE_URL`)
- [ ] PostgreSQL está rodando (`pg_isready -h localhost`)
- [ ] Consigo conectar com `psql` usando DATABASE_URL
- [ ] Tabela `state` existe no banco
- [ ] Servidor backend iniciado com `npm start`
- [ ] Testei o endpoint: `curl http://localhost:3001/api/state`

## 🆘 Se Ainda Não Funcionar

1. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
2. **Reinicie o backend** (`npm start`)
3. **Veja os logs detalhados** do servidor
4. **Reinicie o PostgreSQL**

Se tudo falhar:
```bash
# Destruir e refazer banco
dropdb inspec360_dev
createdb inspec360_dev
psql inspec360_dev < backend/schema.sql  # se tiver arquivo schema
```

## 📌 Nota Importante

**O erro foi revertido para relatório correto:**
- ❌ Antes: Silenciava erros e usava localStorage como fallback
- ✅ Agora: Reporta erros de verdade para que você possa corrigi-los

Isso significa:
- Se ver erro 500 → PostgreSQL realmente está com problema
- Se sincronizar com sucesso → Está usando PostgreSQL

**Nada de modo \"offline silencioso\"** - você quer banco de dados!

## 🔗 Recursos Úteis

- [PostgreSQL Windows Downloads](https://www.postgresql.org/download/windows/)
- [Render Database Documentation](https://render.com/docs/databases)
- [psql Command Line Reference](https://www.postgresql.org/docs/current/app-psql.html)
- [CONNECTION STRINGS - PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html)
