import { useEffect, useState } from 'react';
import { getStore } from '@/app/data/store';

/**
 * Hook para disparar re-render quando dados são sincronizados
 * Componentes que usam este hook serão re-renderizados quando dados mudam
 */
export function useDataSync() {
  const [syncCounter, setSyncCounter] = useState(0);

  useEffect(() => {
    const handleDataRefresh = () => {
      setSyncCounter(prev => prev + 1);
      console.log('[useDataSync] Dados sincronizados, atualizando componente...');
    };

    window.addEventListener('dataRefresh', handleDataRefresh);
    return () => window.removeEventListener('dataRefresh', handleDataRefresh);
  }, []);

  return { syncCounter };
}

/**
 * Força sincronização imediata com backend
 */
export async function forceSync(): Promise<boolean> {
  try {
    console.log('[ForceSync] Sincronizando com backend...');
    
    const store = getStore();
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: store
      }),
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      console.log('[ForceSync] ✅ Sincronização concluída com sucesso');
      window.dispatchEvent(new CustomEvent('dataRefresh', { 
        detail: { timestamp: Date.now(), source: 'forceSync' } 
      }));
      return true;
    }
    
    console.error('[ForceSync] ❌ Erro do servidor:', response.status);
    return false;
  } catch (error) {
    console.error('[ForceSync] ❌ Erro ao sincronizar:', error);
    return false;
  }
}
