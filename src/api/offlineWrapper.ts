import { offlineStorage } from '../storage/indexedDB'

export class OfflineAPIWrapper {
  private baseClient: any

  constructor(baseClient: any) {
    this.baseClient = baseClient
  }

  async request(
    method: string,
    url: string,
    options?: {
      body?: any
      headers?: Record<string, string>
    }
  ) {
    const isOnline = navigator.onLine

    // Para requisições GET em offline, tentar retornar cache
    if (method === 'GET' && !isOnline) {
      try {
        await offlineStorage.init()
        const cached = await offlineStorage.getCachedData(url)
        if (cached) {
          return cached
        }
      } catch (error) {
        console.error('Erro ao buscar cache:', error)
      }
    }

    try {
      // Tentar fazer a requisição normal
      const response = await this.baseClient(method, url, options)

      // Cachear respostas GET bem-sucedidas
      if (method === 'GET') {
        try {
          await offlineStorage.init()
          await offlineStorage.cacheData(url, response)
        } catch (error) {
          console.error('Erro ao cachear dados:', error)
        }
      }

      return response
    } catch (error) {
      // Se falhou e é GET, tentar cache
      if (method === 'GET') {
        try {
          await offlineStorage.init()
          const cached = await offlineStorage.getCachedData(url)
          if (cached) {
            console.log('Usando cache para:', url)
            return cached
          }
        } catch (cacheError) {
          console.error('Erro ao buscar cache:', cacheError)
        }
      }

      // Se falhou e é POST/PUT/DELETE, armazenar para sync
      if (['POST', 'PUT', 'DELETE'].includes(method) && !isOnline) {
        try {
          await offlineStorage.init()
          await offlineStorage.addPendingRequest({
            url,
            method,
            body: options?.body ? JSON.stringify(options.body) : undefined,
            headers: options?.headers
          })

          // Retornar resposta simulada
          return {
            success: true,
            offline: true,
            message: 'Solicitação será sincronizada quando estiver online'
          }
        } catch (storageError) {
          console.error('Erro ao armazenar requisição pendente:', storageError)
        }
      }

      throw error
    }
  }

  // Método para sincronizar requisições pendentes
  async syncPendingRequests() {
    try {
      await offlineStorage.init()
      const pending = await offlineStorage.getPendingRequests()

      for (const request of pending) {
        try {
          const response = await this.baseClient(request.method, request.url, {
            body: request.body ? JSON.parse(request.body) : undefined,
            headers: request.headers
          })

          if (response) {
            // Remover da fila de pendência
            if (request.id) {
              await offlineStorage.removePendingRequest(request.id)
            }
          }
        } catch (error) {
          console.error('Erro ao sincronizar:', request.url, error)
          // Deixar na fila para próxima tentativa
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar requisições pendentes:', error)
    }
  }
}
