# 🚀 Guia Completo: Deploy com Render + GitHub

## 📋 Pré-requisitos

- [x] Conta GitHub (https://github.com)
- [x] Conta Render (https://render.com)
- [x] Git instalado no computador (https://git-scm.com)
- [x] PNPM instalado (`npm install -g pnpm`)

---

## ⚡ Passo 1: Preparar o Repositório Local

### 1.1 Inicializar Git (se ainda não estiver)

```bash
cd c:\inspec360 v2.1
git init
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"
```

### 1.2 Adicionar todos os arquivos

```bash
git add .
```

### 1.3 Criar primeiro commit

```bash
git commit -m "Inicialização INSPEC360 v2.1 - Deploy com Render"
```

---

## 🔗 Passo 2: Criar e Configurar Repositório no GitHub

### 2.1 Criar novo repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `inspec360-v2`
3. Descrição: "Sistema de Inspeções com Georeferenciamento"
4. Escolha: **Public** ou **Private** (conforme preferência)
5. **NÃO** marque "Initialize this repository with"
6. Clique em **Create repository**

### 2.2 Adicionar remoto ao Git local

Após criar o repositório no GitHub, você receberá URLs. Execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/inspec360-v2.git
git branch -M main
git push -u origin main
```

**Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub.**

---

## 🌐 Passo 3: Configurar Deploy no Render

### 3.1 Conectar GitHub ao Render

1. Acesse https://dashboard.render.com
2. Clique em **+ New +** > **Blueprint**
3. Conecte sua conta GitHub (será solicitada autorização)
4. Procure pelo repositório `inspec360-v2`
5. Clique em **Connect**

### 3.2 Configurar o Plano de Deploy

1. O Render lerá o arquivo `render.yaml` automaticamente
2. Você verá dois serviços listados:
   - **inspec360-frontend** (React)
   - **inspec360-backend** (Node.js)
3. Verifique as configurações:
   - Runtime: Node
   - Build Command: correto conforme `render.yaml`
   - Start Command: correto conforme `render.yaml`
4. Clique em **Deploy**

### 3.3 Configurar Variáveis de Ambiente

Após iniciar o deploy:

1. Para cada serviço, acesse **Environment**
2. Adicione as variáveis necessárias:

**Backend:**
```
NODE_ENV = production
PORT = 3001
CORS_ORIGIN = https://inspec360-frontend.onrender.com
```

**Frontend:**
```
NODE_ENV = production
PORT = 3000
```

---

## 🔄 Passo 4: Atualizar CORS no Backend

Edite `backend/src/server.js` para usar a variável de ambiente:

```javascript
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
```

---

## 📤 Passo 5: Fazer Push para Atualizar Deploy

Sempre que fizer alterações:

```bash
# 1. Fazer suas mudanças no código

# 2. Adicionar e commitar
git add .
git commit -m "Descrição das mudanças"

# 3. Fazer push
git push origin main
```

Render detectará a mudança automaticamente e iniciará um novo build!

---

## ✅ Checklist de Verificação

- [ ] Repositório GitHub criado
- [ ] Código enviado para GitHub (git push funcionou)
- [ ] Render conectado ao repositório GitHub
- [ ] Deploy iniciou em ambos os serviços
- [ ] Frontend acessível em `https://inspec360-frontend.onrender.com`
- [ ] Backend acessível em `https://inspec360-backend.onrender.com`
- [ ] CORS configurado corretamente
- [ ] Banco de dados inicializado no backend

---

## 🔍 Troubleshooting

### Build está falhando?

1. Verifique os **Logs** no dashboard do Render
2. Procure por erros em:
   - Dependências (npm install)
   - Comandos de build
   - Variáveis de ambiente

### Frontend não consegue se conectar ao backend?

1. Verifique se `CORS_ORIGIN` está correto em `render.yaml`
2. Certifique-se de que a URL do backend no frontend aponta para a URL correta
3. Exemplo: `https://inspec360-backend.onrender.com/api`

### Banco de dados não está inicializando?

1. Conecte via SSH no serviço backend no Render
2. Execute: `npm run init-db`
3. Verifique se `backend/data/inspec360.db` foi criado

### Serviço offline após horas inativas?

No plano free do Render, serviços ficam offline após inatividade. Atualize para plano pago se precisar de disponibilidade 24/7.

---

## 📞 URLs Úteis

- Dashboard Render: https://dashboard.render.com
- GitHub: https://github.com
- Documentação Render: https://render.com/docs
- Documentação Git: https://git-scm.com/doc

---

## 💡 Dicas Importantes

1. **Segurança**: Nunca coloque senhas ou tokens no código. Use variáveis de ambiente!
2. **Commits**: Faça commits frequentes com mensagens descritivas
3. **Testes**: Teste localmente antes de fazer push
4. **Logs**: Sempre verifique os logs do Render em caso de problemas
5. **Backups**: Sempre mantenha backup do banco de dados

---

## 🎯 Próximos Passos

1. ✅ Configurar deploy automático
2. ✅ Monitorar performance do aplicativo
3. ⏳ Considerar upgrade para plano pago quando necessário
4. ⏳ Configurar domínio customizado
5. ⏳ Implementar CI/CD com GitHub Actions (opcional)
