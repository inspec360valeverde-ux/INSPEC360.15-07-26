# 🚀 Como Executar INSPEC360 com Um Clique

## 📋 Opções Disponíveis

### ✅ Opção 1: EXECUTAR-INPEC360.bat (Recomendado)
**Localização:** `C:\INPEC360 V2\EXECUTAR-INPEC360.bat`

1. Duplo-clique no arquivo
2. Uma janela de comando aparecer mostrando o progresso
3. Duas janelas se abrem (Backend + Frontend)
4. O navegador abre automaticamente

### ✅ Opção 2: INPEC360.vbs (Silencioso)
**Localização:** `C:\INPEC360 V2\INPEC360.vbs`

1. Duplo-clique no arquivo
2. Sem janela de comando visível
3. Sistema inicia em background
4. Navegador abre automaticamente

---

## 📌 Criar Atalhos na Área de Trabalho

### Passo 1: Execute o criador de atalhos
```
Duplo-clique em: criar-atalhos-desktop.bat
```

### Passo 2: Selecione opções (se solicitado)
A maioria dos sistemas cria automaticamente

### Passo 3: Verifique a Área de Trabalho
Você terá dois novos atalhos:
- **INSPEC360.lnk** - Com janela de comando
- **INSPEC360 (Silencioso).lnk** - Sem janela

### Passo 4: Usar (próximas vezes)
Simplesmente **duplo-clique** no atalho desejado

---

## 🔐 Credenciais de Acesso

Após o sistema iniciar, abra o navegador em **http://localhost:5173**

| Tipo | Email | Senha |
|------|-------|-------|
| Supervisor | supervisor@inspec360.com | sup123 |
| Admin | admin@inspec360.com | admin123 |
| Técnico | tecnico@inspec360.com | tec123 |

---

## 📡 URLs do Sistema

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health

---

## ⏹️ Como Parar o Sistema

Feche ambas as janelas de comando (Backend e Frontend)

---

## 🆘 Troubleshooting

### Erro: "Node.js não encontrado"
- Verifique se Node.js v18+ está instalado
- Baixe em: https://nodejs.org/

### Erro: "npm não reconhecido"
- Reinicie o computador
- Ou execute: `criar-atalhos.bat` no diretório raiz

### Porta 3000 ou 5173 já em uso
- Feche outros programas que usem essas portas
- Ou altere as portas nos arquivos de configuração

---

## 💡 Dicas

✅ Mantenha ambas as janelas abertas enquanto usar o sistema
✅ O navegador abre automaticamente
✅ Você pode minimizar as janelas de comando
✅ Para parar, simplesmente feche as duas janelas

