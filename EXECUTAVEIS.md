# 🚀 Executáveis de Inicialização - INSPEC360 v2.2

## Arquivos Criados

Você tem 4 arquivos executáveis para usar:

### 1️⃣ **start-inspec360.bat** ← CLIQUE DUPLO PARA INICIAR
```
Um clique para rodar TUDO!
Abre Backend + Frontend + Navegador automaticamente
```

### 2️⃣ **start-inspec360.vbs** ← Versão "silenciosa"
```
Mesma coisa que acima, mas sem janela de comando
Mais profissional, recomendado para usar no dia a dia
```

### 3️⃣ **stop-inspec360.bat** ← Para parar o sistema
```
Clique quando quiser parar tudo
Encerra Backend e Frontend
```

### 4️⃣ **stop-inspec360.vbs** ← Parar "silencioso"
```
Mesma coisa, mas sem janela de comando
```

---

## Como Usar

### Para Iniciar ✅

**Opção 1 (Mais comum):**
- Clique duplo em **`start-inspec360.bat`**

**Opção 2 (Mais bonito):**
- Clique duplo em **`start-inspec360.vbs`**

Isso vai:
1. ✅ Verificar Node.js
2. ✅ Criar banco de dados (se não existir)
3. ✅ Abrir Backend em uma janela
4. ✅ Abrir Frontend em outra janela
5. ✅ Abrir navegador automaticamente
6. ✅ Pronto para usar!

### Para Parar ⏹️

**Opção 1:**
- Clique duplo em **`stop-inspec360.bat`**

**Opção 2:**
- Clique duplo em **`stop-inspec360.vbs`**

**Opção 3 (Manual):**
- Feche as 2 janelas (Backend e Frontend) uma por uma
- Pressione `Ctrl+C` em cada janela se necessário

---

## O Que Cada Um Faz

### start-inspec360.bat

```batch
1. Verifica Node.js
   ❌ Se não tiver, avisa para instalar

2. Cria banco de dados
   ✅ Se não existir, executa npm run init-db

3. Abre Backend em nova janela
   Nome da janela: "INSPEC360 Backend :3000"
   Comando: npm run dev

4. Aguarda 3 segundos

5. Abre Frontend em nova janela
   Nome da janela: "INSPEC360 Frontend :5173"
   Comando: npm run dev

6. Aguarda 5 segundos

7. Abre navegador
   URL: http://localhost:5173

8. Exibe informações
   URLs, credenciais, dicas
```

### start-inspec360.vbs

Faz EXATAMENTE a mesma coisa, mas:
- Não mostra janela de comando
- Apenas executa o `.bat` escondido
- Resultado final é idêntico

### stop-inspec360.bat

```batch
1. Procura janela com título "INSPEC360 Backend*"
2. Encerra o processo
3. Procura janela com título "INSPEC360 Frontend*"
4. Encerra o processo
5. Exibe mensagem de sucesso
```

### stop-inspec360.vbs

Mesma coisa, mas escondido.

---

## 📍 Localização

Coloque os arquivos na **raiz da pasta do projeto**:

```
C:\INPEC360 V2\
├── start-inspec360.bat      ← CLIQUE DUPLO
├── start-inspec360.vbs      ← OU AQUI
├── stop-inspec360.bat       ← Para parar
├── stop-inspec360.vbs       ← Versão silenciosa
├── backend/
├── src/
├── data/
└── public/
```

---

## 🎯 Recomendado

**Primeira vez?**
Use `start-inspec360.bat` para ver o que está acontecendo.

**Depois?**
Use `start-inspec360.vbs` para iniciar sem ver a janela de comando.

---

## ✅ Passo a Passo Rápido

### 1º Dia (Setup)
```
1. Clique duplo em: start-inspec360.bat
2. Aguarde 10 segundos
3. Navegador abre automaticamente
4. Login com: supervisor@inspec360.com / sup123
```

### 2º Dia em diante
```
1. Clique duplo em: start-inspec360.vbs
2. Aguarde 10 segundos
3. Sistema está pronto para usar
```

### Para parar
```
1. Clique duplo em: stop-inspec360.vbs
   OU
2. Feche as 2 janelas abertas
```

---

## 🔍 Verificação

### Verificar se está rodando

Abra navegador e acesse:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Health:** http://localhost:3000/api/health

Devem estar acessíveis.

### Verificar janelas abertas

Abra **Gerenciador de Tarefas** (Ctrl+Shift+Esc):

Procure por:
- `node.exe` rodando (Backend)
- `node.exe` rodando (Frontend)

Se ambas existem, está funcionando!

---

## 🛠️ Troubleshooting

### Nada acontece ao clicar?

1. Clique duplo no `.bat` em vez do `.vbs`
2. Você verá a mensagem de erro
3. Veja a solução abaixo

### "Node.js não está instalado"

✅ Baixe em: https://nodejs.org/ (v18+)

### Porta 3000 ou 5173 em uso

❌ Já tem algo usando a porta

Solução:
```powershell
# Terminal PowerShell
# Matar processo na porta 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force

# Matar processo na porta 5173
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force
```

Depois tente novamente.

### Navegador não abre

Abra manualmente:
```
http://localhost:5173
```

### Sistema não responde

1. Clique em `stop-inspec360.vbs`
2. Aguarde 2 segundos
3. Clique em `start-inspec360.vbs` novamente

---

## 📊 Informações

Quando você clica em `start-inspec360.bat`, aparece:

```
╔════════════════════════════════════════════════════════════╗
║   INSPEC360 v2.2 - INICIANDO SISTEMA                      ║
╚════════════════════════════════════════════════════════════╝

[1/4] Verificando Node.js...
✅ Node.js v20.11.0 encontrado

[2/4] Verificando banco de dados...
✅ Banco de dados OK

[3/4] Iniciando Backend...
[Abre janela new]

[4/4] Iniciando Frontend...
[Abre outra janela]

✅ Sistema iniciando...

🌐 Abrindo navegador em http://localhost:5173

╔════════════════════════════════════════════════════════════╗
║   ✅ INSPEC360 INICIADO COM SUCESSO!                       ║
╚════════════════════════════════════════════════════════════╝

📡 URLs:
   Backend:  http://localhost:3000
   Frontend: http://localhost:5173

🔐 Credenciais padrão:
   Email:   supervisor@inspec360.com
   Senha:   sup123
```

---

## 🎓 Explicação Técnica

### .bat vs .vbs

**`.bat` (Batch)**
- Arquivo de comando do Windows
- Você vê a janela de comando
- Útil para debug
- Mais lento visualmente

**`.vbs` (VBScript)**
- Script Visual Basic
- Executa o `.bat` escondido
- Sem janela de comando
- Mais profissional
- Recomendado para uso diário

---

## 💡 Dicas

### Atalho no Desktop

Crie um atalho de `start-inspec360.vbs` na área de trabalho:

1. Clique direito em `start-inspec360.vbs`
2. "Enviar para" → "Área de Trabalho (cria atalho)"
3. Agora você tem atalho no desktop

### Senha do Admin

Se quiser testar como admin:

```
Email:   admin@inspec360.com
Senha:   admin123
```

### Senha do Técnico

```
Email:   tecnico1@inspec360.com
Senha:   tec123
```

---

## ⏱️ Tempo de Carregamento

Esperado:

```
1. Click no executável: Imediato
2. Verificar Node.js: < 1 segundo
3. Verificar banco: < 1 segundo
4. Abrir Backend: 2-3 segundos
5. Abrir Frontend: 3-5 segundos
6. Abrir navegador: Imediato
─────────────────────────────
TOTAL: ~10 segundos
```

---

## 🎉 Pronto!

Agora você tem 2 formas de rodar INSPEC360:

| Método | Modo | Janela | Recomendado |
|--------|------|--------|-------------|
| `start-inspec360.bat` | Visual | Visível | Primeira vez |
| `start-inspec360.vbs` | Silencioso | Escondido | Diariamente |

---

**Versão:** 2.2.0  
**Data:** 07/05/2026  
**Status:** ✅ Executáveis funcionais
