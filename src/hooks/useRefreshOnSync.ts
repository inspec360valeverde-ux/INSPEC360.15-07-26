import { useEffect, useCallback } from 'react';

/**
 * Hook para forçar re-render quando dados são sincronizados
 * Pode ser usado em componentes que exibem dados que podem mudar em outro dispositivo
 */
export function useRefreshOnSync() {
  const forceRefresh = useCallback(() => {
    // Solução simples: recarregar a página para garantir sincronização
    // Alternativa mais suave: usar fetch para recarregar dados específicos
    console.log('[Refresh] Dados sincronizados de outro dispositivo, recarregando...');
    
    // Opção 1: Reload completo (mais confiável)
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, []);

  useEffect(() => {
    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('[Refresh] evento dataSync recebido:', customEvent.detail);
      
      // Só fazer reload se o evento veio do backend (não do próprio dispositivo)
      if (customEvent.detail?.source !== 'self') {
        forceRefresh();
      }
    };

    window.addEventListener('dataSync', handleSync);
    return () => window.removeEventListener('dataSync', handleSync);
  }, [forceRefresh]);
}
