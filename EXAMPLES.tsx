/**
 * EXEMPLO - Como usar BackendStore em componentes React
 * 
 * Este arquivo demonstra padrões práticos para integrar o backend
 * em seus componentes do React
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLO 1: Hook para Listar Estruturas
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { structureStore, syncManager } from '@/app/data/backendStore';

export function useStructures() {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStructures() {
      try {
        setLoading(true);
        const data = await structureStore.getAll();
        setStructures(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    loadStructures();

    // Sincronizar quando dados forem atualizados
    const unsubscribe = syncManager.onSync((data) => {
      if (data.structures) {
        setStructures(data.structures);
      }
    });

    return unsubscribe;
  }, []);

  return { structures, loading, error };
}

// Uso em componente:
// const { structures, loading } = useStructures();

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLO 2: Componente de Login
// ─────────────────────────────────────────────────────────────────────────────

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { userStore } from '@/app/data/backendStore';

export function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const user = await userStore.login(email, password);
      
      // Salvar usuário atual
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Redirecionar baseado no role
      window.location.href = user.role === 'tecnico' ? '/tecnico' : '/supervisor';
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      {error && <div className="text-red-500">{error}</div>}
      <Button disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLO 3: Criar Inspeção
// ─────────────────────────────────────────────────────────────────────────────

import { serviceOrderStore, inspectionStore } from '@/app/data/backendStore';

async function createInspectionFlow(
  structureId: string,
  supervisorId: string,
  technicianId: string
) {
  try {
    // 1. Criar ordem de serviço
    const order = await serviceOrderStore.create({
      type: 'inspecao',
      structureId,
      structureName: 'Torre 001', // Você buscaria do banco
      supervisorId,
      supervisorName: 'Rafael',
      technicianId,
      technicianName: 'Carlos'
    });

    // 2. Criar inspeção baseada na ordem
    const inspection = await inspectionStore.create({
      orderId: order.id,
      estruturaId: order.structureId,
      estruturaNome: order.structureName,
      supervisorId: order.supervisorId,
      supervisorNome: order.supervisorName,
      tecnicoId: order.technicianId,
      tecnicoNome: order.technicianName
    });

    return inspection;
  } catch (error) {
    console.error('Erro ao criar inspeção:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLO 4: Upload de Foto
// ─────────────────────────────────────────────────────────────────────────────

async function handlePhotoUpload(
  inspectionId: string,
  file: File,
  componentId?: string,
  anomalyId?: string
) {
  try {
    const photo = await inspectionStore.uploadPhoto(
      inspectionId,
      file,
      {
        componentId,
        anomalyId,
        caption: `Foto capturada em ${new Date().toLocaleString()}`
      }
    );

    console.log('Foto salva:', photo);
    
    // Exibir preview
    const preview = URL.createObjectURL(file);
    return {
      id: photo.id,
      url: preview,
      serverUrl: photo.url
    };

  } catch (error) {
    console.error('Erro ao upload foto:', error);
    throw error;
  }
}

// Uso em componente com input:
// <input
//   type="file"
//   accept="image/*"
//   onChange={(e) => {
//     const file = e.target.files?.[0];
//     if (file) handlePhotoUpload(inspectionId, file);
//   }}
// />

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLO 5: Pausar e Retomar Inspeção
// ─────────────────────────────────────────────────────────────────────────────

async function pauseInspection(
  inspectionId: string,
  currentUser: { id: string; name: string },
  reason: string
) {
  try {
    const pause = await inspectionStore.pause(inspectionId, {
      userId: currentUser.id,
      userName: currentUser.name,
      motivo: reason
    });

    // Atualizar status da inspeção
    await inspectionStore.update(inspectionId, {
      status: 'pausado'
    });

    return pause;
  } catch (error) {
    console.error('Erro ao pausar inspeção:', error);
    throw error;
  }
}

async function resumeInspection(pauseId: string, inspectionId: string) {
  try {
    await inspectionStore.resume(pauseId);

    // Atualizar status da inspeção
    await inspectionStore.update(inspectionId, {
      status: 'em-andamento'
    });
  } catch (error) {
    console.error('Erro ao retomar inspeção:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLO 6: Adicionar Anomalia com Foto
// ─────────────────────────────────────────────────────────────────────────────

async function recordAnomaly(
  inspectionId: string,
  componentInspectionId: string,
  anomalyName: string,
  severity: 'baixa' | 'media' | 'alta' | 'critica',
  photoFile: File,
  observation: string
) {
  try {
    // 1. Registrar anomalia
    const anomaly = await inspectionStore.addAnomaly(inspectionId, {
      componentInspectionId,
      anomalyName,
      severity,
      phase: 'Geral',
      observation
    });

    // 2. Upload de foto da anomalia
    const photo = await inspectionStore.uploadPhoto(
      inspectionId,
      photoFile,
      {
        anomalyId: anomaly.id,
        caption: `${anomalyName} - Severidade ${severity}`
      }
    );

    return {
      anomaly,
      photo
    };
  } catch (error) {
    console.error('Erro ao registrar anomalia:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLO 7: Verificar Status de Sincronização
// ─────────────────────────────────────────────────────────────────────────────

export function SyncStatusIndicator() {
  const [status, setStatus] = useState(syncManager.getStatus());

  useEffect(() => {
    // Atualizar status a cada 5 segundos
    const interval = setInterval(() => {
      setStatus(syncManager.getStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full ${
          status.backendAvailable ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-sm">
        {status.backendAvailable ? 'Backend Conectado' : 'Offline'}
      </span>
      {status.lastSyncTime > 0 && (
        <span className="text-xs text-gray-500">
          Sincronizado há {Math.floor((Date.now() - status.lastSyncTime) / 1000)}s
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLO 8: Listar Inspeções com Loading
// ─────────────────────────────────────────────────────────────────────────────

export function InspectionsList() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await inspectionStore.getAll();
        setInspections(data);
      } catch (error) {
        console.error('Erro ao carregar inspeções:', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      {inspections.map((inspection) => (
        <div key={inspection.id} className="border p-4 rounded">
          <h3>{inspection.estruturaNome}</h3>
          <p>Status: {inspection.status}</p>
          <p>Técnico: {inspection.tecnicoNome}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLO 9: Atualizar Estrutura
// ─────────────────────────────────────────────────────────────────────────────

async function updateStructureStatus(structureId: string, newStatus: string) {
  try {
    const updated = await structureStore.update(structureId, {
      status: newStatus as any
    });

    console.log('Estrutura atualizada:', updated);
    return updated;
  } catch (error) {
    console.error('Erro ao atualizar estrutura:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLO 10: Sincronização Completa na Inicialização
// ─────────────────────────────────────────────────────────────────────────────

export function useInitialSync() {
  useEffect(() => {
    async function syncOnInit() {
      try {
        const data = await syncAllData();
        
        // Salvar em localStorage como cache
        localStorage.setItem('inspec360_cache', JSON.stringify({
          ...data,
          cachedAt: new Date().toISOString()
        }));

        console.log('✅ Sincronização inicial completa');
      } catch (error) {
        console.warn('⚠️ Falha na sincronização inicial:', error);
        // Usar cache do localStorage
        const cached = localStorage.getItem('inspec360_cache');
        if (cached) {
          console.log('Usando cache do localStorage');
        }
      }
    }

    syncOnInit();
  }, []);
}

export { syncAllData } from '@/app/data/backendStore';
