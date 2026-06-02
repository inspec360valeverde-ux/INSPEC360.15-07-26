# 🚀 Atualização Automática de Data/Hora em Cada Deploy

> ⚠️ **IMPORTANTE**: A data e hora de atualização DEVE ser atualizada a cada novo deploy no servidor Render.

## 📋 Como funciona

O sistema INSPEC360 exibe automaticamente no login a data/hora da última atualização:
- **Versão**: v2.1.20260602 (data de build)
- **Última atualização**: 02/06/2026 às 14:30

Isso é controlado pelo arquivo `/public/version.json` que **DEVE** ser atualizado em cada deploy.

## 🔄 Processo Automático (Recomendado)

### 1️⃣ Verificar se `prebuild` está no package.json

```json
{
  "scripts": {
    "prebuild": "node scripts/update-version.js",
    "build": "vite build"
  }
}
```

✅ Se estiver, o script roda automaticamente antes de cada build.

### 2️⃣ Verificar Render Build Command

No dashboard do Render:
1. Vá para **Settings** → **Build Command**
2. Confirme que está: `npm run build` ou `pnpm build`
3. **NÃO** use `vite build` diretamente (isso pula o `prebuild`)

### 3️⃣ Verificar logs do Render

Após deploy, procure nos logs por:
```
✅ version.json atualizado:
   Versão: 2.1.20260602001
   Build Date: 2026-06-02T15:45:30.123Z
```

Se NÃO aparece, o `prebuild` não foi executado. Solução manual abaixo ↓

---

## 🛠️ Processo Manual (Se automático falhar)

### Opção A: Via Linha de Comando (Local)

```bash
# No seu PC, na pasta do projeto
cd "c:\inspec360 v2.1"

# Executar script de atualização
node scripts/update-version.js

# Verificar resultado
cat public/version.json

# Fazer commit e push
git add public/version.json
git commit -m "chore: Atualizar data/hora de build"
git push v2.1 main
```

### Opção B: Atualizar Manualmente

Edite `/public/version.json`:

```json
{
  "version": "2.1.20260602",
  "buildDate": "2026-06-02T15:45:30Z",
  "features": ["camera-fix", "gallery-fallback", "period-sync", "multi-device-sync"],
  "lastUpdate": "Feat: [sua descrição da feature]"
}
```

**Regras do versionamento:**
- `2.1.YYYYMMDD` = data do dia
- `YYYYMMDD` = ano (4 dígitos) + mês (2) + dia (2)
- Exemplo: `2.1.20260602` = 02 de Junho de 2026
- Incrementar para `2.1.20260603` no dia seguinte

---

## ✅ Verificar se Atualizou

### No Desktop

1. Fazer refresh completo: `Ctrl+F5` ou `Cmd+Shift+R`
2. Verificar Console do navegador (F12):
   ```
   ⏱️ Última atualização: 02/06/2026 às 15:45
   ```
3. Verificar `/public/version.json`:
   ```
   buildDate: "2026-06-02T15:45:30Z" (deve ser data/hora atual)
   ```

### No Celular

1. **iOS**: 
   - Safari → Settings → Advanced → Website Data → Limpar
   - Fechar e reabrir Safari
   
2. **Android**: 
   - Abrir DevTools via Inspect
   - Console → procurar por "Última atualização"

3. **PWA (App instalado)**:
   - Aguardar 5-10 minutos (sincronização automática)
   - Ou fechar e reabrir o app
   - Ou ir em: Settings → About → Check for Updates

---

## 🐛 Se Não Atualizar

### Checklist de Debug

- [ ] Arquivo `scripts/update-version.js` existe?
- [ ] `"prebuild"` está em `package.json`?
- [ ] Build command no Render é `npm run build` (não `vite build`)?
- [ ] Logs do Render mostram "✅ version.json atualizado"?
- [ ] Arquivo `/public/version.json` foi modificado?
- [ ] Browser cache foi limpo (Ctrl+F5)?
- [ ] Service Worker foi atualizado (aguarde 10min)?

### Solução Rápida

Se o deploy foi feito mas data não atualizou:

```bash
# Local
node scripts/update-version.js
git add public/version.json
git commit -m "hotfix: Atualizar version.json após deploy"
git push v2.1 main

# Render faz novo build automaticamente
```

---

## 📝 Checklist de Deploy

Use este checklist TODA VEZ que fizer deploy:

- [ ] Todas as mudanças commitadas e pushed
- [ ] Render iniciou novo build (verificar dashboard)
- [ ] Build completou com sucesso
- [ ] Logs mostram "✅ version.json atualizado"
- [ ] Desktop mostra data/hora correta no login (F5)
- [ ] Celular sincronizou em 5-10 minutos
- [ ] PWA app atualizado (reabrir app)

---

## 🔗 Arquivos Relacionados

- `/public/version.json` - Arquivo que define versão e data
- `/scripts/update-version.js` - Script que atualiza data/hora
- `/src/hooks/useVersionInfo.ts` - Hook que lê version.json
- `/src/app/components/LoginScreen.tsx` - Mostra data no login
- `/package.json` - Define `prebuild` script

---

## 💡 Dicas

1. **Adicione ao GitHub Actions** (CI/CD automático):
   ```yaml
   - name: Update version
     run: node scripts/update-version.js
   ```

2. **Testar localmente**:
   ```bash
   npm run build
   cat public/version.json
   ```

3. **Sincronização celular**:
   - Sistema checa `/version.json` a cada 5 minutos
   - Recarrega app automaticamente se versão for diferente
   - Limpa cache e resync dados

---

## 📞 Suporte

Se data continuar desatualizada após seguir este guia:

1. Verifique logs completos do Render (Build & Deploy)
2. Confirme que `public/version.json` foi modificado no repositório
3. Limpe cache do navegador completamente
4. Aguarde 10 minutos para sincronização automática
5. Se ainda não funcionar, atualize manualmente (Opção B acima)
