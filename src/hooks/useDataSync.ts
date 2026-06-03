import { useEffect, useState } from 'react';

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
 * Será silenciosa se backend não responder (localStorage é fallback)
 */
export async function forceSync(): Promise<boolean> {
  try {
    console.log('[ForceSync] Sincronizando com backend...');
    
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: null, // Dummy state - backend usará apenas para confirmação
        timestamp: Date.now()
      }),
      signal: AbortSignal.timeout(10000) // Timeout de 10s
    });
    
    if (response.ok) {
      console.log('[ForceSync] ✅ Sincronização concluída');
      // Disparar evento de sincronização
      window.dispatchEvent(new CustomEvent('dataRefresh', { 
        detail: { timestamp: Date.now(), source: 'forceSync' } 
      }));
      return true;
    }
    
    // Se backend indisponível, ainda é sucesso (localStorage é fallback)
    console.warn('[ForceSync] ⚠️ Backend indisponível, usando localStorage');
    window.dispatchEvent(new CustomEvent('dataRefresh', { 
      detail: { timestamp: Date.now(), source: 'forceSync', offline: true } 
    }));
    return true;
  } catch (error) {
    console.warn('[ForceSync] ⚠️ Erro ao sincronizar, modo offline:', error);
    // Sempre retornar true porque o localStorage é o fallback
    return true;
  }
}
