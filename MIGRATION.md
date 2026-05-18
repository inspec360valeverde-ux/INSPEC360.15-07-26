# Guia de Migração - Frontend Local → Backend Integrado

Este guia mostra como migrar o frontend de armazenamento local para sincronização com backend.

## 📦 Importações Necessárias

### Antigo (localStorage)
```typescript
import { useAppStore } from '@/app/data/store';
```

### Novo (Backend + localStorage)
```typescript
import { 
  backendStore, 
  userStore, 
  structureStore, 
  inspectionStore 
} from '@/app/data/backendStore';
```

## 🔑 Autenticação (Login)

### Antigo
```typescript
const users = [...INITIAL_USERS];
const user = users.find(u => u.email === email && u.password === password);
if (user) {
  // Salvar em localStorage
  localStorage.setItem('currentUser', JSON.stringify(user));
}
```

### Novo
```typescript
try {
  const user = await userStore.login(email, password);
  // Backend valida e retorna usuário com lastLogin atualizado
  localStorage.setItem('currentUser', JSON.stringify(user));
} catch (error) {
  console.error('Login falhou:', error);
}
```

## 📊 Listar Estruturas

### Antigo
```typescript
const structures = store.structures; // Do estado local
```

### Novo
```typescript
try {
  const structures = await structureStore.getAll();
  // Backend retorna todas as estruturas do banco
} catch (error) {
  console.error('Erro ao carregar estruturas:', error);
}
```

## ✏️ Criar Estrutura

### Antigo
```typescript
const newStructure = {
  id: `str_${Date.now()}`,
  name: 'Torre 001',
  // ...
};
store.structures.push(newStructure);
```

### Novo
```typescript
const newStructure = await structureStore.create({
  name: 'Torre 001',
  type: 'Suspensão',
  coordX: -23.5505,
  coordY: -46.6333,
  // ...
  createdBy: currentUser.id
});
// Sincronizado automaticamente
```

## 🔍 Obter Estrutura por ID

### Antigo
```typescript
const structure = store.structures.find(s => s.id === id);
```

### Novo
```typescript
const structure = await structureStore.getById(id);
// Retorna do banco
```

## 📋 Criar Ordem de Serviço

### Antigo
```typescript
const order = {
  id: `ord_${Date.now()}`,
  type: 'inspecao',
  // ...
};
store.serviceOrders.push(order);
```

### Novo
```typescript
const order = await serviceOrderStore.create({
  type: 'inspecao',
  structureId,
  supervisorId: currentUser.id,
  // ...
});
// Sincronizado com backend
```

## 🔧 Criar Inspeção

### Antigo
```typescript
const inspection = {
  id: `insp_${Date.now()}`,
  orderId,
  // ...
  components: []
};
store.inspections.push(inspection);
```

### Novo
```typescript
const inspection = await inspectionStore.create({
  orderId,
  estruturaId: structure.id,
  estruturaNome: structure.name,
  supervisorId: supervisor.id,
  supervisorNome: supervisor.name,
  tecnicoId: technician.id,
  tecnicoNome: technician.name,
  // ...
});
// Retorna com ID gerado pelo servidor
```

## 🔄 Adicionar Componente à Inspeção

### Antigo
```typescript
inspection.components.push({
  id: `comp_${Date.now()}`,
  componentId: 'isoladores',
  status: 'pendente'
});
```

### Novo
```typescript
const component = await inspectionStore.addComponent(
  inspectionId,
  {
    componentId: 'isoladores',
    componentName: 'Isoladores',
    status: 'pendente'
  }
);
// Salvo no banco
```

## ⚡ Adicionar Anomalia

### Antigo
```typescript
const anomaly = {
  id: `anom_${Date.now()}`,
  componentId,
  anomalyName: 'Trinca',
  severity: 'alta'
};
component.anomalies.push(anomaly);
```

### Novo
```typescript
const anomaly = await inspectionStore.addAnomaly(
  inspectionId,
  {
    componentInspectionId: componentId,
    anomalyName: 'Trinca',
    severity: 'alta',
    phase: 'A',
    observation: 'Trinca na porcelana'
  }
);
// Salvo com ID único do servidor
```

## 📸 Upload de Foto

### Antigo
```typescript
// Salvar em base64
const photoBase64 = await fileToBase64(file);
inspection.photos.push({
  id: `photo_${Date.now()}`,
  data: photoBase64,
  caption: 'Foto da anomalia'
});
```

### Novo
```typescript
const photo = await inspectionStore.uploadPhoto(
  inspectionId,
  file, // File object
  {
    componentId: 'isoladores',
    anomalyId: anomaly.id,
    caption: 'Foto da anomalia encontrada'
  }
);
// Arquivo salvo em public/images/inspections/
// Metadados no banco de dados
```

## ⏸️ Pausar Inspeção

### Antigo
```typescript
inspection.status = 'pausado';
inspection.pausedAt = new Date();
```

### Novo
```typescript
const pause = await inspectionStore.pause(
  inspectionId,
  {
    userId: technician.id,
    userName: technician.name,
    motivo: 'Chuva intensa'
  }
);
// Histórico de pausas registrado no banco
```

## ▶️ Retomar Inspeção

### Antigo
```typescript
inspection.status = 'em-andamento';
inspection.resumedAt = new Date();
```

### Novo
```typescript
await inspectionStore.resume(pauseId);
// Histórico atualizado no banco
```

## 🔄 Sincronização Automática

O `SyncManager` sincroniza dados a cada 30 segundos:

```typescript
import { syncManager } from '@/app/data/backendStore';

// Escutar mudanças
const unsubscribe = syncManager.onSync((data) => {
  console.log('Dados sincronizados:', data);
  // Atualizar estado do React
});

// Verificar status
const status = syncManager.getStatus();
console.log(status.backendAvailable); // true/false
```

## 🛠️ Exemplo Completo - Fluxo de Inspeção

```typescript
import { 
  serviceOrderStore, 
  inspectionStore, 
  structureStore,
  componentStore
} from '@/app/data/backendStore';

// 1️⃣ Criar ordem de serviço
const order = await serviceOrderStore.create({
  type: 'inspecao',
  structureId: 'str_001',
  structureName: 'Torre 001',
  supervisorId: 'usr_supervisor_001',
  supervisorName: 'Rafael',
  technicianId: 'usr_tecnico_001',
  technicianName: 'Carlos'
});

// 2️⃣ Criar inspeção
const inspection = await inspectionStore.create({
  orderId: order.id,
  estruturaId: order.structureId,
  estruturaNome: order.structureName,
  supervisorId: order.supervisorId,
  supervisorNome: order.supervisorName,
  tecnicoId: order.technicianId,
  tecnicoNome: order.technicianName
});

// 3️⃣ Listar componentes disponíveis
const components = await componentStore.getAll();

// 4️⃣ Inspecionar cada componente
for (const comp of components) {
  const componentInspection = await inspectionStore.addComponent(
    inspection.id,
    {
      componentId: comp.id,
      componentName: comp.name,
      status: 'em-andamento'
    }
  );

  // Se encontrou anomalia
  if (foundAnomaly) {
    const anomaly = await inspectionStore.addAnomaly(
      inspection.id,
      {
        componentInspectionId: componentInspection.id,
        anomalyName: 'Trinca',
        severity: 'alta'
      }
    );

    // Tirar foto da anomalia
    const photo = await inspectionStore.uploadPhoto(
      inspection.id,
      photoFile,
      {
        componentId: comp.id,
        anomalyId: anomaly.id,
        caption: 'Anomalia encontrada'
      }
    );
  }
}

// 5️⃣ Finalizar inspeção
await inspectionStore.update(inspection.id, {
  status: 'concluido',
  dataHoraFim: new Date().toISOString(),
  observacoesGerais: 'Inspeção concluída sem problemas maiores'
});

// ✅ Tudo sincronizado com backend!
```

## 🎯 Próximos Passos

1. **Atualizar componentes** que usam `store` local para `backendStore`
2. **Remover localStorage** onde apropriado (dados vão pro backend)
3. **Implementar fallback** para modo offline (se necessário)
4. **Testar sincronização** em múltiplos dispositivos
5. **Deploy** do backend para servidor de produção

## ⚠️ Considerações

- **Autenticação:** Implementar JWT/tokens em produção
- **Validação:** Adicionar validação no backend
- **Permissões:** Implementar roles-based access control
- **Backup:** Configurar backup automático do SQLite
- **HTTPS:** Usar HTTPS em produção
