# 🎯 Executáveis - Guia Rápido

Criei **4 executáveis** para você usar INSPEC360 v2.2 super fácil!

---

## 🚀 Os 4 Arquivos

### 1️⃣ **start-inspec360.vbs** ⭐ RECOMENDADO
```
✅ Clique duplo
✅ Backend + Frontend + Navegador abrem automaticamente
✅ Sem janela de comando (mais profissional)
✅ Tempo: ~10 segundos
```

### 2️⃣ **start-inspec360.bat**
```
✅ Clique duplo
✅ Mesma coisa que acima
❌ MAS você vê a janela de comando
✅ Útil para ver o que está acontecendo
```

### 3️⃣ **stop-inspec360.vbs** ⏹️
```
✅ Clique duplo para PARAR o sistema
✅ Encerra Backend + Frontend
✅ Sem janela de comando
```

### 4️⃣ **criar-atalhos.bat** 🎗️
```
✅ Clique duplo APENAS UMA VEZ
✅ Cria atalhos no desktop
✅ Atalhos aparecem como:
   🚀 Iniciar INSPEC360
   ⏹️ Parar INSPEC360
```

---

## 🎯 O Que Fazer Agora?

### 1️⃣ Primeira Vez (Setup)

```
1. Execute: setup.bat (ou setup.sh no Mac/Linux)
2. Aguarde terminar
3. Todas as dependências instaladas
4. Banco criado
```

### 2️⃣ Criar Atalhos no Desktop

```
1. Clique duplo em: criar-atalhos.bat
2. Aguarde terminar
3. Desktop agora tem 2 atalhos:
   🚀 Iniciar INSPEC360
   ⏹️ Parar INSPEC360
```

### 3️⃣ Usar o Sistema (Todos os dias)

```
1. Clique duplo em: 🚀 Iniciar INSPEC360 (no desktop)
2. Aguarde 10 segundos
3. Navegador abre em http://localhost:5173
4. PRONTO! 🎉
```

### 4️⃣ Para Parar

```
1. Clique duplo em: ⏹️ Parar INSPEC360
   OU
2. Feche as 2 janelas de comando que abriram
```

---

## 📊 Resumo Executáveis

| Arquivo | O que faz | Quando usar |
|---------|-----------|------------|
| `start-inspec360.vbs` | Inicia Backend + Frontend | Diariamente (recomendado) |
| `start-inspec360.bat` | Inicia Backend + Frontend | Primeira vez (para debug) |
| `stop-inspec360.vbs` | Para Backend + Frontend | Quando terminar |
| `criar-atalhos.bat` | Cria atalhos no desktop | Uma única vez |

---

## 🚀 Fluxo de Uso

```
Primeira instalação:
├─ Executar setup.bat          (1x - setup)
├─ Executar criar-atalhos.bat  (1x - criar atalhos)
└─ Todos os dias depois:
  ├─ Clique em 🚀 no desktop
  ├─ Sistema inicia em 10s
  ├─ Use o sistema
  └─ Clique em ⏹️ quando terminar
```

---

## ✨ Exemplos de Uso

### Cenário 1: Primeira Vez

```powershell
# 1. Abrir pasta C:\INPEC360 V2
# 2. Clique duplo em: setup.bat
# Aguarde terminar (3-5 minutos)

# 3. Clique duplo em: criar-atalhos.bat
# Aguarde terminar (1 minuto)

# 4. Desktop agora tem atalhos
```

### Cenário 2: Uso Diário

```
1. Clique 2x em: 🚀 Iniciar INSPEC360 (desktop)
2. Aguarde 10 segundos
3. Sistema pronto!
4. Use normalmente
5. Clique 2x em: ⏹️ Parar INSPEC360 (desktop) quando terminar
```

### Cenário 3: Debug/Desenvolvimento

```
# Se quiser ver logs:
1. Clique duplo em: start-inspec360.bat
2. Você vê janela de comando com logs
3. Pode copiar mensagens de erro
4. Parar: Feche as janelas
```

---

## 🔍 Verificação

### Sistema está rodando?

Abra navegador em:
```
http://localhost:5173
```

Deve mostrar a página de login.

### Janelas abertas?

Procure em **Gerenciador de Tarefas**:
- Janela: "INSPEC360 Backend :3000"
- Janela: "INSPEC360 Frontend :5173"

Se ambas existem, está funcionando! ✅

---

## 🛠️ Troubleshooting

### Nada acontece ao clicar no .vbs

Tente o `.bat` em vez:
```
Clique duplo em: start-inspec360.bat
```

Você verá a mensagem de erro na janela de comando.

### "Node.js não encontrado"

Instale Node.js v18+:
```
https://nodejs.org/
```

Depois tente novamente.

### Porta 3000 ou 5173 em uso

Já tem algo usando a porta. Execute:

```powershell
# Terminal PowerShell (como admin)

# Matar na porta 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# Matar na porta 5173
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force
```

Tente novamente.

### Atalhos não foram criados

Execute como administrador:
```
1. Clique direito em: criar-atalhos.bat
2. "Executar como administrador"
3. Sim na confirmação
```

---

## 📁 Estrutura

Após usar os executáveis, você terá:

```
C:\INPEC360 V2\
├── start-inspec360.vbs      ← Principal (use este)
├── start-inspec360.bat      ← Alternativa
├── stop-inspec360.vbs       ← Para parar
├── stop-inspec360.bat       ← Alternativa
├── criar-atalhos.bat        ← Criar atalhos (1x)
├── setup.bat                ← Setup inicial (1x)
├── backend/
├── data/
├── public/
└── src/

DESKTOP:
├── 🚀 Iniciar INSPEC360.lnk  ← Criado por criar-atalhos.bat
└── ⏹️ Parar INSPEC360.lnk    ← Criado por criar-atalhos.bat
```

---

## 💡 Dicas Profissionais

### Dica 1: Deixar sempre acessível

Coloque um atalho em:
- Desktop
- Pasta "Quick Access" (Acesso Rápido)
- Taskbar (fixar atalho)

### Dica 2: Batch file vs VBS

- **`.bat`** = Você vê o progresso (útil para debug)
- **`.vbs`** = Mais profissional, sem janela visível

### Dica 3: Múltiplas instâncias?

Não é possível rodar 2 vezes na mesma máquina (portas 3000 e 5173 já em uso).

Se precisar, use portas diferentes em `vite.config.ts`.

### Dica 4: Backup

Antes de usar em produção, guarde uma cópia:
```
C:\INPEC360 V2\ → Cópia em C:\INPEC360 V2 - Backup\
```

---

## 📊 Tempos Esperados

| Etapa | Tempo |
|-------|-------|
| Clique → Verificar Node.js | < 1s |
| Criar banco (1ª vez) | 2-3s |
| Iniciar Backend | 2-3s |
| Iniciar Frontend | 3-5s |
| Abrir navegador | 1s |
| **TOTAL** | **~10-15s** |

---

## ✅ Checklist Final

- [ ] Node.js v18+ instalado
- [ ] setup.bat executado com sucesso
- [ ] criar-atalhos.bat executado com sucesso
- [ ] Atalhos aparecem no desktop
- [ ] Clique 2x em "🚀 Iniciar INSPEC360"
- [ ] Backend abre em nova janela
- [ ] Frontend abre em outra janela
- [ ] Navegador abre em http://localhost:5173
- [ ] Página de login carrega
- [ ] Login funciona (supervisor@inspec360.com / sup123)
- [ ] Dashboard aparece
- [ ] Clique em "⏹️ Parar INSPEC360" para parar
- [ ] Janelas fecham
- [ ] PRONTO! ✅

---

## 🎉 Você Está Pronto!

Agora você tem um sistema que:
- ✅ Inicia com 1 clique
- ✅ Funciona completamente
- ✅ Para com 1 clique
- ✅ Pronto para produção

---

**Versão:** 2.2.0  
**Data:** 07/05/2026  
**Status:** ✅ Executáveis 100% funcionais
