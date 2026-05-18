/**
 * Store Integrado com Backend
 * 
 * Sistema de sincronização bidirecional entre frontend e backend
 * Fallback para localStorage quando backend não está disponível
 */

import type {
  SystemUser,
  Structure,
  ServiceOrder,
  InspectionRecord,
  ExecutionRecord,
  ComponentRule,
} from './types';
import * as api from '../api/client';

// ─────────────────────────────────────────────────────────────────────────────
// GERENCIADOR DE SINCRONIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

class SyncManager {
  private backendAvailable = false;
  private syncInProgress = false;
  private lastSyncTime = 0;
  private syncInterval = 30000; // 30 segundos
  private listeners: Array<(data: any) => void> = [];

  constructor() {
    this.initializeSync();
  }

  // Inicializar verificação de conexão
  private async initializeSync() {
    // Verificar conexão com backend
    this.backendAvailable = await api.syncAPI.checkConnection();
    console.log(
      this.backendAvailable
        ? '✅ Backend conectado'
        : '⚠️ Backend offline - usando localStorage'
    );

    // Sincronizar periodicamente
    if (this.backendAvailable) {
      setInterval(() => this.autoSync(), this.syncInterval);
    }
  }

  // Auto-sincronização periódica
  private async autoSync() {
    if (this.syncInProgress || !this.backendAvailable) return;

    try {
      this.syncInProgress = true;
      const data = await api.syncAPI.syncAll();
      this.lastSyncTime = Date.now();
      this.notifyListeners(data);
    } catch (error) {
      console.warn('Sincronização automática falhou:', error);
      this.backendAvailable = false;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Registrar listener para mudanças
  onSync(callback: (data: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notificar listeners
  private notifyListeners(data: any) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  // Obter status
  getStatus() {
    return {
      backendAvailable: this.backendAvailable,
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress,
    };
  }
}

// Instância global
export const syncManager = new SyncManager();

// ─────────────────────────────────────────────────────────────────────────────
// WRAPPERS DE API COM FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wrapper para operações de usuários
 */
export const userStore = {
  async getAll(): Promise<SystemUser[]> {
    try {
      return await api.usersAPI.getAll();
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<SystemUser | null> {
    try {
      return await api.usersAPI.getById(id);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      return null;
    }
  },

  async login(email: string, password: string): Promise<SystemUser> {
    return api.usersAPI.login(email, password);
  },

  async create(userData: Partial<SystemUser>): Promise<SystemUser> {
    const user = await api.usersAPI.create(userData);
    syncManager.notifyListeners({ users: [user] });
    return user;
  },

  async update(id: string, userData: Partial<SystemUser>): Promise<SystemUser> {
    const user = await api.usersAPI.update(id, userData);
    syncManager.notifyListeners({ users: [user] });
    return user;
  },
};

/**
 * Wrapper para operações de estruturas
 */
export const structureStore = {
  async getAll(): Promise<Structure[]> {
    try {
      return await api.structuresAPI.getAll();
    } catch (error) {
      console.error('Erro ao carregar estruturas:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Structure | null> {
    try {
      return await api.structuresAPI.getById(id);
    } catch (error) {
      console.error('Erro ao carregar estrutura:', error);
      return null;
    }
  },

  async create(structureData: Partial<Structure>): Promise<Structure> {
    const structure = await api.structuresAPI.create(structureData);
    syncManager.notifyListeners({ structures: [structure] });
    return structure;
  },

  async update(id: string, structureData: Partial<Structure>): Promise<Structure> {
    const structure = await api.structuresAPI.update(id, structureData);
    syncManager.notifyListeners({ structures: [structure] });
    return structure;
  },
};

/**
 * Wrapper para operações de componentes
 */
export const componentStore = {
  async getAll(): Promise<ComponentRule[]> {
    try {
      return await api.componentsAPI.getAll();
    } catch (error) {
      console.error('Erro ao carregar componentes:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<ComponentRule | null> {
    try {
      return await api.componentsAPI.getById(id);
    } catch (error) {
      console.error('Erro ao carregar componente:', error);
      return null;
    }
  },

  async create(componentData: Partial<ComponentRule>): Promise<ComponentRule> {
    const component = await api.componentsAPI.create(componentData);
    syncManager.notifyListeners({ components: [component] });
    return component;
  },
};

/**
 * Wrapper para operações de ordens de serviço
 */
export const serviceOrderStore = {
  async getAll(): Promise<ServiceOrder[]> {
    try {
      return await api.serviceOrdersAPI.getAll();
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<ServiceOrder | null> {
    try {
      return await api.serviceOrdersAPI.getById(id);
    } catch (error) {
      console.error('Erro ao carregar ordem de serviço:', error);
      return null;
    }
  },

  async create(orderData: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const order = await api.serviceOrdersAPI.create(orderData);
    syncManager.notifyListeners({ serviceOrders: [order] });
    return order;
  },

  async update(id: string, orderData: Partial<ServiceOrder>): Promise<ServiceOrder> {
    const order = await api.serviceOrdersAPI.update(id, orderData);
    syncManager.notifyListeners({ serviceOrders: [order] });
    return order;
  },
};

/**
 * Wrapper para operações de inspeções
 */
export const inspectionStore = {
  async getAll(): Promise<InspectionRecord[]> {
    try {
      return await api.inspectionsAPI.getAll();
    } catch (error) {
      console.error('Erro ao carregar inspeções:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<InspectionRecord | null> {
    try {
      return await api.inspectionsAPI.getById(id);
    } catch (error) {
      console.error('Erro ao carregar inspeção:', error);
      return null;
    }
  },

  async create(inspectionData: Partial<InspectionRecord>): Promise<InspectionRecord> {
    const inspection = await api.inspectionsAPI.create(inspectionData);
    syncManager.notifyListeners({ inspections: [inspection] });
    return inspection;
  },

  async update(id: string, inspectionData: Partial<InspectionRecord>): Promise<InspectionRecord> {
    const inspection = await api.inspectionsAPI.update(id, inspectionData);
    syncManager.notifyListeners({ inspections: [inspection] });
    return inspection;
  },

  async addComponent(inspectionId: string, componentData: any) {
    return api.inspectionsAPI.addComponent(inspectionId, componentData);
  },

  async addAnomaly(inspectionId: string, anomalyData: any) {
    return api.inspectionsAPI.addAnomaly(inspectionId, anomalyData);
  },

  async uploadPhoto(inspectionId: string, file: File, metadata: any = {}) {
    return api.photosAPI.upload(inspectionId, file, metadata);
  },

  async pause(inspectionId: string, pauseData: any) {
    return api.inspectionsAPI.pause(inspectionId, pauseData);
  },

  async resume(pauseId: string) {
    return api.inspectionsAPI.resume(pauseId);
  },
};

/**
 * Wrapper para operações de execuções
 */
export const executionStore = {
  async getAll(): Promise<ExecutionRecord[]> {
    try {
      return await api.executionsAPI.getAll();
    } catch (error) {
      console.error('Erro ao carregar execuções:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<ExecutionRecord | null> {
    try {
      return await api.executionsAPI.getById(id);
    } catch (error) {
      console.error('Erro ao carregar execução:', error);
      return null;
    }
  },

  async create(executionData: Partial<ExecutionRecord>): Promise<ExecutionRecord> {
    const execution = await api.executionsAPI.create(executionData);
    syncManager.notifyListeners({ executions: [execution] });
    return execution;
  },

  async update(id: string, executionData: Partial<ExecutionRecord>): Promise<ExecutionRecord> {
    const execution = await api.executionsAPI.update(id, executionData);
    syncManager.notifyListeners({ executions: [execution] });
    return execution;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SINCRONIZAÇÃO COMPLETA
// ─────────────────────────────────────────────────────────────────────────────

export async function syncAllData() {
  try {
    const data = await api.syncAPI.syncAll();
    return data;
  } catch (error) {
    console.error('Erro ao sincronizar todos os dados:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR TUDO
// ─────────────────────────────────────────────────────────────────────────────

export const backendStore = {
  syncManager,
  userStore,
  structureStore,
  componentStore,
  serviceOrderStore,
  inspectionStore,
  executionStore,
  syncAllData,
};

export default backendStore;
