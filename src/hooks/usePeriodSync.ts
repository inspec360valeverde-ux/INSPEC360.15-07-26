import { useEffect } from 'react';

/**
 * Hook para sincronização periódica de dados com backend
 * Verifica a cada 10 segundos se há mudanças no servidor
 * e atualiza o frontend automaticamente
 */
export function usePeriodSync() {
  useEffect(() => {
    // Não sincronizar se offline
    if (!navigator.onLine) return;

    const syncInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/state', {
          signal: AbortSignal.timeout(3000),
        });

        if (!response.ok) {
          console.log('[Sync] Backend indisponível');
          return;
        }

        const { state, found } = await response.json();

        if (found && state) {
          const storageKey = 'inspec360_v22_data';
          const currentData = localStorage.getItem(storageKey);
          const newDataString = JSON.stringify(state);

          // Comparar se houve mudanças
          if (currentData !== newDataString) {
            console.log('[Sync] ✅ Mudanças detectadas, atualizando...');
            localStorage.setItem(storageKey, newDataString);

            // Disparar evento custom para notificar componentes
            window.dispatchEvent(
              new CustomEvent('dataSync', {
                detail: { timestamp: Date.now(), source: 'backend' },
              })
            );
          }
        }
      } catch (error) {
        if (error instanceof TypeError) {
          console.log('[Sync] ⚠️ Timeout ou erro de rede');
        }
      }
    }, 10000); // 10 segundos

    // Sincronizar também quando app volta para foreground
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log('[Sync] App voltou para foreground, sincronizando...');

        try {
          const response = await fetch('/api/state', {
            signal: AbortSignal.timeout(3000),
          });

          if (!response.ok) return;

          const { state, found } = await response.json();
          if (found && state) {
            const storageKey = 'inspec360_v22_data';
            localStorage.setItem(storageKey, JSON.stringify(state));

            window.dispatchEvent(
              new CustomEvent('dataSync', {
                detail: { timestamp: Date.now(), source: 'foreground' },
              })
            );
          }
        } catch (error) {
          console.log('[Sync] Erro ao sincronizar em foreground');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Sincronizar também quando conexão volta online
    const handleOnline = () => {
      console.log('[Sync] Conexão restaurada, sincronizando...');
      window.dispatchEvent(
        new CustomEvent('dataSync', {
          detail: { timestamp: Date.now(), source: 'online' },
        })
      );
    };

    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
}

/**
 * Hook para listen em eventos de sincronização
 * Pode ser usado em componentes que precisam reagir a atualizações
 */
export function useOnDataSync(callback: (event: CustomEvent) => void) {
  useEffect(() => {
    const handler = (event: Event) => {
      callback(event as CustomEvent);
    };

    window.addEventListener('dataSync', handler);
    return () => window.removeEventListener('dataSync', handler);
  }, [callback]);
}
