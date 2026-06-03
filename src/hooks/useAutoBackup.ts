import { useEffect } from 'react';
import { getStore } from '@/app/data/store';
import { createBackupInStorage, getBackupsList } from '@/utils/backupManager';

const AUTO_BACKUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hora
const STORAGE_KEY_LAST_AUTO_BACKUP = 'inspec360_last_auto_backup';

/**
 * Hook para criar backups automáticos periodicamente
 * Executa a cada 1 hora se a última execução foi há mais de 1 hora
 */
export function useAutoBackup(): void {
  useEffect(() => {
    const checkAndCreateBackup = () => {
      try {
        const lastBackupTime = localStorage.getItem(STORAGE_KEY_LAST_AUTO_BACKUP);
        const now = Date.now();

        // Se nunca foi feito backup ou passou 1 hora
        if (!lastBackupTime || now - parseInt(lastBackupTime) >= AUTO_BACKUP_INTERVAL_MS) {
          const store = getStore();
          createBackupInStorage(store);
          localStorage.setItem(STORAGE_KEY_LAST_AUTO_BACKUP, now.toString());
          console.log('[AutoBackup] ✅ Backup automático criado');
        }
      } catch (error) {
        console.error('[AutoBackup] ❌ Erro ao criar backup automático:', error);
      }
    };

    // Verificar na montagem do componente
    checkAndCreateBackup();

    // Configurar intervalo para verificar a cada 30 minutos
    const interval = setInterval(checkAndCreateBackup, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}

/**
 * Informações sobre status de backup automático
 */
export function getAutoBackupInfo() {
  const lastBackupTime = localStorage.getItem(STORAGE_KEY_LAST_AUTO_BACKUP);
  const backupsList = getBackupsList();
  
  return {
    lastAutoBackupTime: lastBackupTime ? new Date(parseInt(lastBackupTime)) : null,
    totalBackups: backupsList.totalBackups,
    lastBackup: backupsList.lastBackup ? new Date(backupsList.lastBackup) : null,
  };
}
