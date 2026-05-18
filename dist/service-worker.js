const CACHE_NAME = 'inspec360-v2-cache'
const SYNC_TAG = 'inspec360-sync'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx'
]

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache essential files, ignore errors for missing files
      return Promise.all(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch(() => console.log(`Could not cache ${url}`))
        )
      )
    })
  )
  self.skipWaiting()
})

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch - Network first for API, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API requests - Network first, fallback to stale cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached response if offline
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached
            }
            // Return offline indicator
            return new Response(JSON.stringify({ offline: true }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            })
          })
        })
    )
  }
  // Static assets - Cache first
  else if (
    request.method === 'GET' &&
    (url.pathname.match(/\.(js|css|png|jpg|svg|woff|woff2)$/) ||
      url.pathname.includes('/assets/'))
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      })
    )
  }
  // HTML - Network first
  else if (request.method === 'GET' && url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => caches.match(request))
    )
  }
})

// Background Sync - Retry failed POST/PUT/DELETE
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncPendingRequests())
  }
})

async function syncPendingRequests() {
  const db = await openPendingDB()
  const pending = await getAllPending(db)

  for (const item of pending) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body ? JSON.parse(item.body) : undefined
      })

      if (response.ok) {
        await deletePending(db, item.id)
      }
    } catch (error) {
      console.log('Sync error for', item.url, error)
    }
  }
}

function openPendingDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('inspec360-pending', 1)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function getAllPending(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['requests'], 'readonly')
    const store = transaction.objectStore('requests')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function deletePending(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['requests'], 'readwrite')
    const store = transaction.objectStore('requests')
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
