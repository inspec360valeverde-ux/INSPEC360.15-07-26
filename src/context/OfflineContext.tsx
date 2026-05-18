import React, { createContext, useContext, useEffect, useState } from 'react'
import { offlineStorage } from '../storage/indexedDB'

interface OfflineContextType {
  isOnline: boolean
  pendingCount: number
  hasPendingRequests: boolean
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)

  // Monitor online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      offlineStorage.setOfflineState(true).catch(console.error)
      // Trigger sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.sync.register('inspec360-sync').catch(console.error)
        })
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      offlineStorage.setOfflineState(false).catch(console.error)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check pending requests periodically
  useEffect(() => {
    const checkPending = async () => {
      try {
        await offlineStorage.init()
        const pending = await offlineStorage.getPendingRequests()
        setPendingCount(pending.length)
      } catch (error) {
        console.error('Error checking pending requests:', error)
      }
    }

    checkPending()
    const interval = setInterval(checkPending, 5000)

    return () => clearInterval(interval)
  }, [])

  // Clean old cache
  useEffect(() => {
    offlineStorage.clearOldCache().catch(console.error)
    const interval = setInterval(() => {
      offlineStorage.clearOldCache().catch(console.error)
    }, 60 * 60 * 1000) // Every hour

    return () => clearInterval(interval)
  }, [])

  const value: OfflineContextType = {
    isOnline,
    pendingCount,
    hasPendingRequests: pendingCount > 0
  }

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  )
}

export function useOnlineStatus() {
  const context = useContext(OfflineContext)
  if (context === undefined) {
    throw new Error('useOnlineStatus must be used within OfflineProvider')
  }
  return context
}
