# Auto-Deploy para Render

Este workflow GitHub Actions faz deploy automático para o Render sempre que há push na branch `main`.

## Configuração Necessária

### 1. Gerar Render API Key
- Acesse: https://dashboard.render.com/account/api-tokens
- Clique em "Create API Token"
- Copie o token gerado

### 2. Configurar GitHub Secrets
- Vá para o repositório no GitHub
- Settings → Secrets and variables → Actions
- Clique em "New repository secret"
- Crie dois secrets:
  - `RENDER_API_KEY` = (cole a API key do Render)
  - `RENDER_SERVICE_ID` = (seu ID do serviço, ex: srv-abc123def456)

### 3. Encontrar Service ID
- Dashboard Render → Seu serviço `inspec360`
- URL será algo como: `https://dashboard.render.com/services/srv-abc123def456`
- O ID é a parte após `/srv-`

Após configurar, cada push na `main` fará deploy automático! 🚀
