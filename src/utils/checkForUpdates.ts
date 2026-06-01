/**
 * Sistema de detecção de atualizações para PWA
 * Verifica periodicamente se há nova versão e força refresh
 */

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutos

export function initUpdateCheck() {
  // Verificar na primeira carga (após 2 segundos)
  setTimeout(() => {
    checkForUpdates()
  }, 2000)

  // Verificar periodicamente
  setInterval(() => {
    checkForUpdates()
  }, VERSION_CHECK_INTERVAL)

  // Verificar quando app volta para foreground
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('[UpdateCheck] App voltou para foreground, verificando atualizações...')
      checkForUpdates()
    }
  })
}

async function checkForUpdates() {
  try {
    console.log('[UpdateCheck] Verificando nova versão...')
    
    // Buscar version.json para detectar mudanças
    // Adicionar timestamp para forçar não usar cache
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

    if (response.ok) {
      const versionData = await response.json() as any
      const newVersion = versionData.version || 'unknown'
      const currentVersion = sessionStorage.getItem('appVersion') || 'initial'
      
      console.log(`[UpdateCheck] Versão atual: ${currentVersion}, Nova: ${newVersion}`)
      
      if (currentVersion !== 'initial' && newVersion !== currentVersion) {
        console.log('[UpdateCheck] Nova versão detectada! Recarregando...')
        console.log(`  - Mudanças: ${versionData.lastUpdate || 'veja version.json'}`)
        sessionStorage.setItem('appVersion', newVersion)
        
        // Limpar cache do service worker
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          console.log(`[UpdateCheck] Limpando ${cacheNames.length} caches...`)
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          )
        }
        
        // Recarregar após limpar cache
        setTimeout(() => {
          console.log('[UpdateCheck] Recarregando página...')
          window.location.reload()
        }, 500)
      } else {
        // Registrar versão na primeira vez
        if (currentVersion === 'initial') {
          sessionStorage.setItem('appVersion', newVersion)
          console.log(`[UpdateCheck] Versão inicial registrada: ${newVersion}`)
        }
      }
    }
  } catch (error) {
    console.log('[UpdateCheck] Erro ao verificar atualizações:', error)
  }
}

/**
 * Força reload imediato (para uso em caso de erros críticos)
 */
export function forceReload() {
  console.log('[UpdateCheck] Forçando reload...')
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
        .then(() => window.location.reload(true))
    })
  } else {
    window.location.reload(true)
  }
}

