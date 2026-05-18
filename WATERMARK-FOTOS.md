# 📸 Watermark de Fotos - Marca d'água com GPS e Data/Hora

## ✅ O que foi implementado

Agora as fotos tiradas com INSPEC360 terão uma **marca d'água (watermark) visível** contendo:

✅ **Componente** (ex: Isoladores)  
✅ **Anomalia** (ex: Trinca) - se houver  
✅ **Data e Hora** (ex: 18/05/2026 14:30:25)  
✅ **Coordenadas GPS** (ex: GPS: -23.55089, -46.63331)  
✅ **Precisão GPS** (ex: ±8.5m)

---

## 📱 Como Usar (Passo a Passo)

### **1. Abrir INSPEC360**
```
Login → Técnico → Iniciar Inspeção
```

### **2. Ir para componente**
```
Componente: Isoladores
└─ Registrar Evidências Fotográficas
```

### **3. Capturar GPS (Recomendado)**
```
Clique em [GPS] (roxo)
  ↓
Escolher "Permitir" na permissão de localização
  ↓
Aguardar: "GPS OK ✓" (verde)
```

### **4. Tirar Foto com Watermark**

**Opção A: Câmera (recomendado)**
```
[Câmera]
  ↓
Posicionar e capturar a foto
  ↓
Preview com MARCA D'ÁGUA:
┌────────────────────────┐
│                        │
│   [Foto da anomalia]   │
│                        │
├────────────────────────┤
│ Isoladores - Trinca    │ ← Componente + Anomalia
│ Data/Hora: 18/05/2...  │ ← Data e hora automática
│ GPS: -23.55089, -46... │ ← Coordenadas
│ Precisão: ±8.5m        │ ← Precisão do GPS
└────────────────────────┘
```

**Opção B: Galeria (arquivo existente)**
```
[Galeria]
  ↓
Selecionar arquivo
  ↓
Watermark é adicionado automaticamente
```

### **5. Confirmar**
```
[Confirmar] 
  ↓
Foto aparece na grid com watermark
  ↓
Enviada ao servidor automaticamente
```

---

## 👀 Exemplo Real de Watermark

```
┌───────────────────────────────────────┐
│                                       │
│     [Torre com Isolador danificado]   │
│                                       │
│                                       │
│                                       │
│                                       │
│                                       │
├───────────────────────────────────────┤
│ Isoladores - Trinca na porcelana      │ ← Branco com contorno preto
│ Data/Hora: 18/05/2026 14:30:25        │    (bem legível)
│ GPS: -23.55089, -46.63331            │
│ Precisão: ±8.5m                       │
└───────────────────────────────────────┘
```

---

## 🔧 Funcionalidades

| Recurso | Descrição | Status |
|---------|-----------|--------|
| **Watermark visível** | Texto escrito na própria foto | ✅ |
| **GPS automático** | Latitude e longitude capturadas | ✅ |
| **Data/hora** | Automática do sistema | ✅ |
| **Precisão do GPS** | Mostra ±Xm na foto | ✅ |
| **Componente identificado** | Nome do componente | ✅ |
| **Anomalia** | Nome da anomalia (se houver) | ✅ |
| **Fonte legível** | Branco com contorno preto | ✅ |
| **Responsivo** | Ajusta ao tamanho da foto | ✅ |
| **Funciona offline** | Watermark aplicado localmente | ✅ |

---

## 🎨 Aparência do Watermark

### **Estilo:**
- **Cor**: Branco com contorno preto (bem legível em qualquer fundo)
- **Fonte**: Arial Bold, tamanho responsivo
- **Posição**: Canto inferior esquerdo (não bloqueia conteúdo importante)
- **Opacidade**: 90% branco (não transparente demais)

### **Layout do texto (4 linhas):**
```
Linha 1: [Componente] - [Anomalia]
Linha 2: Data/Hora: 18/05/2026 14:30:25
Linha 3: GPS: -23.55089, -46.63331
Linha 4: Precisão: ±8.5m
```

### **Exemplo com diferentes layouts:**

**Sem anomalia:**
```
Isoladores
Data/Hora: 18/05/2026 14:30:25
GPS: -23.55089, -46.63331
Precisão: ±8.5m
```

**Com anomalia:**
```
Isoladores - Trinca
Data/Hora: 18/05/2026 14:30:25
GPS: -23.55089, -46.63331
Precisão: ±8.5m
```

**Sem GPS:**
```
Isoladores - Trinca
Data/Hora: 18/05/2026 14:30:25
GPS: Não capturado
Precisão: N/A
```

---

## 📸 Resultado Final

### **No Celular/Desktop (durante captura):**
```
Preview mostra a foto com o watermark
Técnico vê na hora a marca d'água
Pode recapturar se não gostar
```

### **No Banco de Dados:**
```sql
SELECT * FROM inspectionPhotos WHERE id = 'photo_xyz';

filePath:  /images/inspections/insp_456/Isoladores/Trinca/20260518_143025...jpg
caption:   "Isoladores - Trinca @ 18/05/2026 14:30:25 [GPS: -23.55089, -46.63331]"
latitude:  -23.55089
longitude: -46.63331
accuracy:  8.5
```

### **No Relatório do Supervisor:**
```
Foto aparece com a marca d'água já visível
Supervisor vê os dados diretamente na imagem
Não precisa consultar banco de dados
Auditoria completa e rastreável
```

---

## ⚙️ Arquivos Criados/Modificados

### **Criados:**
- ✅ `src/utils/watermarkImage.ts` - Funções de watermark
- ✅ `src/components/CameraWithWatermark.tsx` - Componente de câmera com preview

### **Modificados:**
- ✅ `src/components/PhotoManager.tsx` - Integração de watermark e câmera

---

## 🧪 Como Testar

1. **Parar app anterior:** `stop-inspec360.bat`

2. **Iniciar:**
   ```bash
   cd backend && npm run init-db && npm run dev  # Terminal 1
   pnpm dev  # Terminal 2
   ```

3. **Abrir:** `http://localhost:5173`

4. **Login:** Técnico / tec123

5. **Teste:**
   - Iniciar inspeção
   - Clicar [GPS] → permitir
   - Clicar [Câmera] 
   - Ver preview **COM WATERMARK**
   - [Confirmar]
   - Foto salva com marca d'água

---

## 💡 Dicas

### **Para melhor qualidade:**
- ✅ Capturar em local bem iluminado
- ✅ Usar a câmera traseira (melhor qualidade)
- ✅ Manter dispositivo firme
- ✅ Aguardar GPS capturado (verde) antes de tirar

### **Se watermark ficar muito grande:**
- Sistema ajusta automaticamente ao tamanho da foto
- Fotos grandes = watermark maior (sempre proporcional)

### **Se coordenadas não aparecerem:**
- Verificar permissão de localização
- Sair de ambientes fechados
- Tentar novamente em local aberto

---

## 🔐 Segurança & Privacidade

✅ Watermark aplicado **localmente no dispositivo**  
✅ Sem envio de dados sensíveis para API  
✅ Permissão de GPS solicitada do usuário  
✅ Fácil auditoria (dados visíveis na foto)  

---

## 🎯 Benefícios Práticos

| Benefício | Como Ajuda |
|-----------|-----------|
| **Auditoria visual** | Supervisor vê tudo direto na foto |
| **Georeferenciamento** | Localizar exatamente onde a foto foi tirada |
| **Rastreabilidade** | Sabe quando, onde e o quê foi fotografado |
| **Sem dubiedade** | Não precisa verificar metadados |
| **Relatórios claros** | Foto é auto-explicativa |
| **Prova legal** | Data/hora/GPS comprovam autenticidade |

---

## 🎯 Próximas Melhorias (Opcionais)

- [ ] Adicionar logo/brasão da empresa no watermark
- [ ] Permitir customizar posição do watermark
- [ ] Filtros de cor para melhor legibilidade
- [ ] Compressão automática sem perder qualidade
- [ ] QR code com link para detalhes da foto

---

**Tudo pronto! Suas fotos agora têm marca d'água automática com GPS e data/hora!** 📸✨
