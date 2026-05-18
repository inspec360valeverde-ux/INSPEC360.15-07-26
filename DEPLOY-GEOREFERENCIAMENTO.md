# 🚀 Guia de Deployment - Georeferenciamento de Fotos

## ⚡ TL;DR (Rápido)

```bash
# 1. Parar qualquer instância anterior
stop-inspec360.bat

# 2. Instalar dependências (se necessário)
pnpm install
cd backend && npm install && cd ..

# 3. Limpar banco antigo (para testar com schema novo)
# ⚠️ ATENÇÃO: Isso apaga todos os dados!
del backend\data\inspec360.db

# 4. Inicializar banco novo com novos campos
cd backend
npm run init-db
cd ..

# 5. Rodar em desenvolvimento
pnpm dev
```

---

## 📋 Checklist de Implementação

### ✅ Backend

- [ ] Arquivo `backend/src/database/init.js` atualizado com campos GPS
- [ ] Arquivo `backend/src/database/queries.js` com nova função createPhoto
- [ ] Arquivo `backend/src/routes/photos.js` com organização de pastas
- [ ] Pastas criadas automaticamente ao enviar foto
- [ ] Banco de dados inicializado: `npm run init-db`

### ✅ Frontend

- [ ] Arquivo `src/hooks/useGeolocation.ts` criado
- [ ] Arquivo `src/components/PhotoUploadWithGeo.tsx` criado
- [ ] Arquivo `src/components/PhotoManager.tsx` criado
- [ ] `InspectionFlow.tsx` atualizado com PhotoManager
- [ ] `ExecutionFlow.tsx` atualizado com PhotoManager
- [ ] Imports atualizados (sem `useRef` em `InspectionFlow`)

### ✅ Testes

- [ ] Backend roda sem erros: `npm run dev` (backend/)
- [ ] Frontend roda sem erros: `pnpm dev`
- [ ] Login funciona
- [ ] Iniciar inspeção funciona
- [ ] Seção "Registrar Evidências" aparece
- [ ] Botão [GPS] solicita permissão
- [ ] Botão [Adicionar Foto] abre câmera/galeria
- [ ] Foto é enviada ao clicar [Enviar]
- [ ] Banco de dados tem nova foto com coordenadas

---

## 🧪 Teste Completo (Passo a Passo)

### **Fase 1: Setup**

```bash
# Terminal 1 - Backend
cd c:\INPEC360 V2\backend
npm run init-db
npm run dev
```

Verificar output:
```
✅ Conexão estabelecida
✅ Tabela users criada
✅ Tabela inspectionPhotos criada (com lat/lon/accuracy)
✅ Server running on http://localhost:3000
```

```bash
# Terminal 2 - Frontend
cd c:\INPEC360 V2
pnpm dev
```

Verificar output:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### **Fase 2: Teste Manual**

1. **Abrir navegador em http://localhost:5173**

2. **Login:**
   - Email: `tecnico1@inspec360.com`
   - Senha: `tec123`

3. **Iniciar Inspeção:**
   - Selecionar ordem de serviço
   - Clicar em "Iniciar Inspeção"

4. **Ir para componente:**
   - Clicar em um componente (ex: Isoladores)
   - Deve aparecer seção "Registrar Evidências Fotográficas"

5. **Capturar GPS:**
   - Clicar botão [GPS]
   - Permitir acesso à localização (no browser)
   - Aguardar: `GPS: -23.xxxxx, -46.xxxxx ✓`

6. **Adicionar Foto:**
   - Clicar [Adicionar Foto]
   - Escolher arquivo (ou usar câmera se dispositivo móvel)
   - Foto aparece em preview

7. **Enviar:**
   - Clicar [Enviar Foto]
   - Ver mensagem de sucesso
   - Foto aparece no grid

### **Fase 3: Verificar no Banco**

```bash
# Terminal 3 - SQL
cd c:\INPEC360 V2
sqlite3 backend/data/inspec360.db

-- Listar todas as fotos
SELECT id, componentName, anomalyName, latitude, longitude, accuracy FROM inspectionPhotos;

-- Resultado esperado:
-- photo_uuid_001 | Isoladores | NULL | -23.55089 | -46.63331 | 8.5
```

### **Fase 4: Verificar Pastas**

```bash
# Terminal PowerShell
cd c:\INPEC360 V2
Get-ChildItem -Path "public/images/inspections" -Recurse

-- Resultado esperado:
Directory: public\images\inspections\insp_456\Isoladores

Mode  Size  Name
d----        Trinca
-a---  2.4MB 20260518_143025_isoladores_trinca_uuid.jpg
```

---

## 🛠️ Troubleshooting Deployment

### ❌ Erro: "Banco de dados não inicializado"

```bash
cd backend
npm run init-db
npm run dev
```

### ❌ Erro: "Pasta de imagens não encontrada"

```bash
# Criar pasta manualmente
mkdir -p public/images/inspections
```

### ❌ Erro: "GPS retorna null"

**Causas comuns:**
- Navegador não solicitou permissão
- Localização desativada no PC/mobile
- Sem WiFi/sinal

**Teste:**
1. Abrir DevTools (F12)
2. Console
3. Executar: `navigator.geolocation.getCurrentPosition(pos => console.log(pos))`
4. Permitir acesso à localização

### ❌ Erro: "Foto não aparece após envio"

**Verificar:**
1. Status HTTP da requisição POST (F12 → Network)
2. Resposta da API (deve ter `filePath`)
3. Arquivo existe em: `public/images/inspections/...`

---

## 📊 Monitoramento Pós-Deploy

### **Logs a monitorar**

**Backend:**
```
✅ POST /api/photos/upload 201 OK
   Foto salva em: inspections/insp_456/Isoladores/Trinca/20260518_143025...jpg
   GPS: -23.55089, -46.63331 (±8.5m)
```

**Frontend Console:**
```
✅ Geolocation: Latitude -23.55089, Longitude -46.63331
✅ Photo uploaded successfully
```

### **Métricas**

- [ ] Tempo médio de upload: < 5s (com WiFi)
- [ ] Tamanho de foto: 500KB - 2MB (após compressão)
- [ ] Precisão GPS: ±5m a ±20m (normal)
- [ ] Taxa de erro: < 1%

---

## 🔐 Segurança

### ✅ Já implementado

- [x] Validação de MIME type (JPEG, PNG, WEBP)
- [x] Limite de tamanho (50MB)
- [x] UUID para nomes de arquivo (não previsível)
- [x] Sem acesso direto a coordenadas (armazenado no BD)

### ⚠️ Para melhorar (opcional)

- [ ] HTTPS/SSL em produção
- [ ] Rate limiting no upload
- [ ] Autenticação de token JWT
- [ ] Criptografia de coordenadas (se públicas)

---

## 📦 Estrutura de Deployment

```
c:\INPEC360 V2\
├── backend/
│   ├── data/
│   │   └── inspec360.db ← Banco com novos campos
│   ├── src/
│   │   ├── database/
│   │   │   ├── init.js ← Modificado
│   │   │   └── queries.js ← Modificado
│   │   └── routes/
│   │       └── photos.js ← Modificado
│   └── package.json
│
├── public/
│   └── images/
│       └── inspections/ ← Fotos organizadas
│           └── insp_456/
│               ├── Isoladores/
│               │   └── Trinca/
│               │       └── 20260518_143025_isoladores_trinca_uuid.jpg
│
├── src/
│   ├── hooks/
│   │   └── useGeolocation.ts ← Novo
│   ├── components/
│   │   ├── PhotoUploadWithGeo.tsx ← Novo
│   │   └── PhotoManager.tsx ← Novo
│   └── app/
│       └── components/
│           └── tecnico/
│               ├── InspectionFlow.tsx ← Modificado
│               └── ExecutionFlow.tsx ← Modificado
│
└── package.json
```

---

## 🎯 Validação Final

Execute este script para validar tudo:

```bash
# bash/powershell
echo "🔍 Validando implementação..."

# 1. Verificar arquivos criados
$files = @(
  "src/hooks/useGeolocation.ts",
  "src/components/PhotoUploadWithGeo.tsx",
  "src/components/PhotoManager.tsx"
)

$files | ForEach-Object {
  if (Test-Path $_) {
    Write-Host "✅ $_ existe"
  } else {
    Write-Host "❌ $_ NÃO encontrado"
  }
}

# 2. Verificar banco
sqlite3 backend/data/inspec360.db "PRAGMA table_info(inspectionPhotos);" | 
  ForEach-Object {
    if ($_ -match "latitude|longitude|accuracy") {
      Write-Host "✅ Campo GPS encontrado: $_"
    }
  }

# 3. Verificar pasta de imagens
if (Test-Path "public/images/inspections") {
  Write-Host "✅ Pasta de imagens existe"
} else {
  Write-Host "❌ Pasta de imagens NÃO existe - criando..."
  New-Item -ItemType Directory -Force -Path "public/images/inspections" | Out-Null
}

echo "✅ Validação concluída!"
```

---

## 📞 Próximos Passos

1. **Testar em todos os navegadores:**
   - Chrome/Chromium ✓
   - Firefox (verificar GPS)
   - Safari (iOS)
   - Edge

2. **Testar em dispositivos móveis:**
   - Android (teste real)
   - iOS (teste real)

3. **Teste de carga:**
   - 100 fotos simultâneas
   - GPS em múltiplos dispositivos

4. **Documentação:**
   - Treinar técnicos
   - Criar vídeo tutorial

---

## ✨ Deploy em Produção

Quando pronto para produção:

```bash
# 1. Backup do banco atual
Copy-Item backend/data/inspec360.db backend/data/inspec360.db.backup

# 2. Build produção
pnpm build

# 3. Deploy (seu processo)
# ... seu deploy aqui ...

# 4. Monitorar erros
# Verificar logs do servidor
tail -f server.log
```

---

**Pronto para começar? Execute o script de teste completo!** 🚀
