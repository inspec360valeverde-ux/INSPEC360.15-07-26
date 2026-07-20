/**
 * INSPEC360 API Client
 * 
 * Cliente para sincronização entre frontend e backend
 * Substitui o armazenamento local pela API REST
 */

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

// ─────────────────────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────────────────────

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USUÁRIOS
// ─────────────────────────────────────────────────────────────────────────────

export const usersAPI = {
  async getAll() {
    return fetchAPI('/users');
  },

  async getById(id) {
    return fetchAPI(`/users/${id}`);
  },

  async create(userData) {
    return fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(email, password) {
    return fetchAPI('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async update(id, userData) {
    return fetchAPI(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTRUTURAS
// ─────────────────────────────────────────────────────────────────────────────

export const structuresAPI = {
  async getAll() {
    return fetchAPI('/structures');
  },

  async getById(id) {
    return fetchAPI(`/structures/${id}`);
  },

  async create(structureData) {
    return fetchAPI('/structures', {
      method: 'POST',
      body: JSON.stringify(structureData),
    });
  },

  async update(id, structureData) {
    return fetchAPI(`/structures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(structureData),
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

export const componentsAPI = {
  async getAll() {
    return fetchAPI('/components');
  },

  async getById(id) {
    return fetchAPI(`/components/${id}`);
  },

  async create(componentData) {
    return fetchAPI('/components', {
      method: 'POST',
      body: JSON.stringify(componentData),
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDENS DE SERVIÇO
// ─────────────────────────────────────────────────────────────────────────────

export const serviceOrdersAPI = {
  async getAll() {
    return fetchAPI('/service-orders');
  },

  async getById(id) {
    return fetchAPI(`/service-orders/${id}`);
  },

  async create(orderData) {
    return fetchAPI('/service-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async update(id, orderData) {
    return fetchAPI(`/service-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INSPEÇÕES
// ─────────────────────────────────────────────────────────────────────────────

export const inspectionsAPI = {
  async getAll() {
    return fetchAPI('/inspections');
  },

  async getById(id) {
    return fetchAPI(`/inspections/${id}`);
  },

  async create(inspectionData) {
    return fetchAPI('/inspections', {
      method: 'POST',
      body: JSON.stringify(inspectionData),
    });
  },

  async update(id, inspectionData) {
    return fetchAPI(`/inspections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inspectionData),
    });
  },

  async addComponent(inspectionId, componentData) {
    return fetchAPI(`/inspections/${inspectionId}/components`, {
      method: 'POST',
      body: JSON.stringify(componentData),
    });
  },

  async addAnomaly(inspectionId, anomalyData) {
    return fetchAPI(`/inspections/${inspectionId}/anomalies`, {
      method: 'POST',
      body: JSON.stringify(anomalyData),
    });
  },

  async pause(inspectionId, pauseData) {
    return fetchAPI(`/inspections/${inspectionId}/pause`, {
      method: 'POST',
      body: JSON.stringify(pauseData),
    });
  },

  async resume(pauseId) {
    return fetchAPI(`/inspections/pause/${pauseId}/resume`, {
      method: 'PUT',
      body: JSON.stringify({}),
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXECUÇÕES
// ─────────────────────────────────────────────────────────────────────────────

export const executionsAPI = {
  async getAll() {
    return fetchAPI('/executions');
  },

  async getById(id) {
    return fetchAPI(`/executions/${id}`);
  },

  async create(executionData) {
    return fetchAPI('/executions', {
      method: 'POST',
      body: JSON.stringify(executionData),
    });
  },

  async update(id, executionData) {
    return fetchAPI(`/executions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(executionData),
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FOTOS
// ─────────────────────────────────────────────────────────────────────────────

export const photosAPI = {
  async getAll(inspectionId) {
    return fetchAPI(`/photos/${inspectionId}`);
  },

  async upload(inspectionId, file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('inspectionId', inspectionId);
    formData.append('componentId', metadata.componentId || '');
    formData.append('anomalyId', metadata.anomalyId || '');
    formData.append('caption', metadata.caption || '');

    try {
      const response = await fetch(`${API_URL}/photos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[API Error] /photos/upload:', error);
      throw error;
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SINCRONIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

export const syncAPI = {
  /**
   * Sincronizar todos os dados do backend para o frontend
   */
  async syncAll() {
    try {
      const [users, structures, components, serviceOrders, inspections, executions] = await Promise.all([
        usersAPI.getAll(),
        structuresAPI.getAll(),
        componentsAPI.getAll(),
        serviceOrdersAPI.getAll(),
        inspectionsAPI.getAll(),
        executionsAPI.getAll(),
      ]);

      return {
        users,
        structures,
        components,
        serviceOrders,
        inspections,
        executions,
        syncedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Sync Error] Falha ao sincronizar dados:', error);
      throw error;
    }
  },

  /**
   * Verificar conexão com o servidor
   */
  async checkConnection() {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR TUDO COMO MÓDULO
// ─────────────────────────────────────────────────────────────────────────────

export default {
  usersAPI,
  structuresAPI,
  componentsAPI,
  serviceOrdersAPI,
  inspectionsAPI,
  executionsAPI,
  photosAPI,
  syncAPI,
};
