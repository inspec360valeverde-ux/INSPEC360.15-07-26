// IndexedDB Wrapper para sincronização offline
const DB_NAME = 'inspec360-data'
const DB_VERSION = 1

interface PendingRequest {
  id?: number
  url: string
  method: string
  body?: string
  headers?: Record<string, string>
  timestamp: number
}

class OfflineStorage {
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Store para requisições pendentes (POST, PUT, DELETE)
        if (!db.objectStoreNames.contains('pending-requests')) {
          const store = db.createObjectStore('pending-requests', {
            keyPath: 'id',
            autoIncrement: true
          })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Store para dados em cache (GET requests)
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'url' })
        }

        // Store para estado offline (flags)
        if (!db.objectStoreNames.contains('offline-state')) {
          db.createObjectStore('offline-state', { keyPath: 'key' })
        }
      }
    })
  }

  // Adicionar requisição pendente
  async addPendingRequest(request: PendingRequest): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending-requests'], 'readwrite')
      const store = transaction.objectStore('pending-requests')
      const req = store.add({
        ...request,
        timestamp: Date.now()
      })

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  // Obter requisições pendentes
  async getPendingRequests(): Promise<PendingRequest[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending-requests'], 'readonly')
      const store = transaction.objectStore('pending-requests')
      const req = store.getAll()

      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  // Remover requisição pendente (após sucesso)
  async removePendingRequest(id: number): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pending-requests'], 'readwrite')
      const store = transaction.objectStore('pending-requests')
      const req = store.delete(id)

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  // Cache de dados (para GET requests)
  async cacheData(url: string, data: unknown): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const req = store.put({
        url,
        data,
        timestamp: Date.now()
      })

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  // Recuperar dados em cache
  async getCachedData(url: string): Promise<unknown | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const req = store.get(url)

      req.onsuccess = () => {
        const result = req.result
        resolve(result ? result.data : null)
      }
      req.onerror = () => reject(req.error)
    })
  }

  // Limpar cache antigo (> 24 horas)
  async clearOldCache(): Promise<void> {
    if (!this.db) await this.init()

    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const req = store.openCursor()

      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const record = cursor.value
          if (record.timestamp && record.timestamp < twentyFourHoursAgo) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
      req.onerror = () => reject(req.error)
    })
  }

  // Estado offline
  async setOfflineState(online: boolean): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline-state'], 'readwrite')
      const store = transaction.objectStore('offline-state')
      const req = store.put({
        key: 'isOnline',
        value: online,
        timestamp: Date.now()
      })

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async isOnline(): Promise<boolean> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline-state'], 'readonly')
      const store = transaction.objectStore('offline-state')
      const req = store.get('isOnline')

      req.onsuccess = () => {
        const result = req.result
        resolve(result ? result.value : navigator.onLine)
      }
      req.onerror = () => reject(req.error)
    })
  }
}

export const offlineStorage = new OfflineStorage()
