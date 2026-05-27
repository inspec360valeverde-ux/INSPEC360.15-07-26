# 🚀 SETUP: Deploy com Render e GitHub

## ⚡ Quick Start (4 passos)

### 1️⃣ Execute o Script de Setup
```bash
setup-deploy.bat
```
Ou manualmente:
```bash
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"
git init
git add .
git commit -m "Inicialização INSPEC360 v2.1"
```

### 2️⃣ Crie o Repositório no GitHub
- Acesse: https://github.com/new
- Nome: `inspec360-v2`
- Private ou Public
- **NÃO marque** "Initialize this repository"
- Clique **Create repository**

### 3️⃣ Envie o Código para GitHub
```bash
git remote add origin https://github.com/SEU_USUARIO/inspec360-v2.git
git branch -M main
git push -u origin main
```
*(Substitua `SEU_USUARIO` pelo seu username do GitHub)*

### 4️⃣ Deploy no Render
- Acesse: https://dashboard.render.com
- Clique em **+ New** → **Blueprint**
- Conecte GitHub (será pedida autorização)
- Selecione `inspec360-v2`
- Clique **Connect**
- Render lerá `render.yaml` automaticamente
- Clique **Deploy**

---

## ✅ Pronto!

Em poucos minutos você terá:
- ✅ Frontend em: `https://inspec360-frontend.onrender.com`
- ✅ Backend em: `https://inspec360-backend.onrender.com`
- ✅ Banco de dados SQLite iniciado
- ✅ Deploy automático: toda mudança em `main` faz novo deploy

---

## 📚 Documentação Completa

Ver arquivo: `DEPLOY-RENDER-GITHUB.md`

---

## 🆘 Precisa de Ajuda?

1. **Build falhando?** → Verifique logs do Render
2. **Não consegue fazer push?** → Gere SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
3. **Backend offline?** → Plano free fica offline após inatividade
4. **Dados sumiram?** → Banco de dados SQLite é local, reseta em redeploy

---

## 🔄 Para Fazer Atualizações Depois

Sempre que fizer mudanças no código:

```bash
git add .
git commit -m "Descreva a mudança"
git push origin main
```

Render detectará e fará novo deploy automaticamente! 🎉
