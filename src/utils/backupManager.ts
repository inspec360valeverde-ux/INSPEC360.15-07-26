import type { AppData } from '@/app/data/types';

export interface BackupFile {
  version: string;
  timestamp: string;
  dateHuman: string;
  dataSize: number;
  hash: string;
}

export interface BackupMetadata {
  backups: BackupFile[];
  totalBackups: number;
  lastBackup: string | null;
}

const BACKUP_KEY_PREFIX = 'inspec360_backup_';
const BACKUP_METADATA_KEY = 'inspec360_backup_metadata';
const MAX_BACKUPS_STORED = 10; // Máximo de backups armazenados localmente

/**
 * Gera hash simples para validar integridade dos dados
 */
function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converter para 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Formata data para formato legível
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Exporta todos os dados em JSON
 */
export function exportDataAsJSON(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Exporta dados como CSV (estruturas)
 */
export function exportStructuresAsCSV(data: AppData): string {
  const headers = ['ID', 'Nome', 'Tipo', 'Classe', 'Latitude', 'Longitude', 'Status', 'Data de Criação'];
  const rows = data.structures.map(s => [
    s.id,
    s.name,
    s.type,
    s.classe || '',
    s.coordY,
    s.coordX,
    s.status,
    s.createdAt || '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  
  return csvContent;
}

/**
 * Exporta dados como CSV (ordens de serviço)
 */
export function exportServiceOrdersAsCSV(data: AppData): string {
  const headers = ['ID', 'Tipo', 'Estrutura', 'Técnico', 'Supervisor', 'Prioridade', 'Status', 'Prazo', 'Data de Criação'];
  const rows = data.serviceOrders.map(order => [
    order.id,
    order.type,
    order.structureId,
    order.technicianId,
    order.supervisorId,
    order.priority,
    order.status,
    order.deadline,
    order.createdAt,
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  
  return csvContent;
}

/**
 * Cria backup automático em localStorage
 */
export function createBackupInStorage(data: AppData): BackupFile {
  const timestamp = new Date().toISOString();
  const backupKey = `${BACKUP_KEY_PREFIX}${timestamp}`;
  const jsonData = JSON.stringify(data);
  const hash = generateHash(jsonData);
  
  const backupFile: BackupFile = {
    version: '2.1',
    timestamp,
    dateHuman: formatDate(timestamp),
    dataSize: jsonData.length,
    hash,
  };
  
  // Armazenar dados do backup
  try {
    localStorage.setItem(backupKey, jsonData);
  } catch (error) {
    console.error('❌ Erro ao armazenar backup em localStorage:', error);
    throw new Error('Espaço insuficiente para backup');
  }
  
  // Atualizar metadados
  updateBackupMetadata(backupFile);
  
  console.log(`✅ Backup criado: ${backupFile.dateHuman}`);
  return backupFile;
}

/**
 * Atualiza lista de metadados de backups
 */
function updateBackupMetadata(newBackup: BackupFile): void {
  let metadata: BackupMetadata = {
    backups: [],
    totalBackups: 0,
    lastBackup: null,
  };
  
  try {
    const stored = localStorage.getItem(BACKUP_METADATA_KEY);
    if (stored) {
      metadata = JSON.parse(stored);
    }
  } catch {
    // Reiniciar se corrupto
  }
  
  // Adicionar novo backup
  metadata.backups.unshift(newBackup);
  metadata.totalBackups = metadata.backups.length;
  metadata.lastBackup = newBackup.timestamp;
  
  // Remover backups antigos se exceder limite
  if (metadata.backups.length > MAX_BACKUPS_STORED) {
    const toDelete = metadata.backups.slice(MAX_BACKUPS_STORED);
    toDelete.forEach(backup => {
      localStorage.removeItem(`${BACKUP_KEY_PREFIX}${backup.timestamp}`);
    });
    metadata.backups = metadata.backups.slice(0, MAX_BACKUPS_STORED);
  }
  
  localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(metadata));
}

/**
 * Obtém lista de backups
 */
export function getBackupsList(): BackupMetadata {
  let metadata: BackupMetadata = {
    backups: [],
    totalBackups: 0,
    lastBackup: null,
  };
  
  try {
    const stored = localStorage.getItem(BACKUP_METADATA_KEY);
    if (stored) {
      metadata = JSON.parse(stored);
    }
  } catch {
    // Retornar vazio se corrupto
  }
  
  return metadata;
}

/**
 * Restaura dados de um backup específico
 */
export function restoreBackup(timestamp: string): AppData | null {
  const backupKey = `${BACKUP_KEY_PREFIX}${timestamp}`;
  
  try {
    const stored = localStorage.getItem(backupKey);
    if (stored) {
      return JSON.parse(stored) as AppData;
    }
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
  }
  
  return null;
}

/**
 * Exclui um backup específico
 */
export function deleteBackup(timestamp: string): boolean {
  const backupKey = `${BACKUP_KEY_PREFIX}${timestamp}`;
  
  try {
    localStorage.removeItem(backupKey);
    
    // Atualizar metadados
    let metadata = getBackupsList();
    metadata.backups = metadata.backups.filter(b => b.timestamp !== timestamp);
    metadata.totalBackups = metadata.backups.length;
    metadata.lastBackup = metadata.backups[0]?.timestamp || null;
    
    localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(metadata));
    
    console.log(`✅ Backup removido: ${timestamp}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar backup:', error);
    return false;
  }
}

/**
 * Faz download de arquivo
 */
export function downloadFile(content: string, filename: string, type: 'json' | 'csv' = 'json'): void {
  const mimeType = type === 'json' ? 'application/json' : 'text/csv';
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`✅ Arquivo baixado: ${filename}`);
}

/**
 * Importa dados de arquivo JSON
 */
export async function importDataFromFile(file: File): Promise<AppData | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as AppData;
        console.log('✅ Dados importados com sucesso');
        resolve(data);
      } catch (error) {
        console.error('❌ Erro ao importar dados:', error);
        reject(new Error('Arquivo inválido ou corrompido'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Calcula tamanho formatado
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Limpa todos os backups
 */
export function clearAllBackups(): void {
  const metadata = getBackupsList();
  metadata.backups.forEach(backup => {
    localStorage.removeItem(`${BACKUP_KEY_PREFIX}${backup.timestamp}`);
  });
  localStorage.removeItem(BACKUP_METADATA_KEY);
  console.log('✅ Todos os backups foram removidos');
}
