import type {
  AppData,
  SystemUser,
  Structure,
  ServiceOrder,
  ActivityLogEntry,
  ComponentInspection,
  InspectionData,
  ComponentRule,
  SeverityOption,
  SystemLog,
  InspectionRecord,
  ExecutionRecord,
  PauseHistoryEntry,
  InspectionPhoto,
} from './types';
import { INITIAL_INSPECTION_COMPONENTS, INITIAL_SEVERITY_OPTIONS } from './checklistRules';

const STORAGE_KEY = 'inspec360_v22_data';
const LOG_RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

// ─── Dados iniciais ──────────────────────────────────────────────────────────

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'u1',
    name: 'Carlos Mendes',
    email: 'carlos@inspec360.com',
    password: '123456',
    role: 'tecnico',
    status: 'active',
    lastLogin: '2026-05-06 08:30',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u2',
    name: 'Rafael Souza',
    email: 'rafael@inspec360.com',
    password: '123456',
    role: 'tecnico',
    status: 'active',
    lastLogin: '2026-05-06 09:15',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u3',
    name: 'André Lima',
    email: 'supervisor@inspec360.com',
    password: '123456',
    role: 'supervisor',
    status: 'active',
    lastLogin: '2026-05-06 07:45',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u4',
    name: 'Administrador',
    email: 'admin@inspec360.com',
    password: '123456',
    role: 'superadm',
    status: 'active',
    lastLogin: '2026-05-06 07:00',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u5',
    name: 'Maria Fernanda',
    email: 'maria@inspec360.com',
    password: '123456',
    role: 'tecnico',
    status: 'inactive',
    lastLogin: '2026-04-28 14:20',
    createdAt: '2026-01-15T00:00:00Z',
  },
];

// Mineração Vale Verde de Craibas, AL ≈ coordY(lat)=-9.44, coordX(lng)=-36.77
const INITIAL_STRUCTURES: Structure[] = [
  {
    id: 's1', name: 'Torre 001', type: 'Terminal', classe: 'AT1',
    coordX: -36.702, coordY: -9.384, lat: -9.384, lng: -36.702,
    progressiva: 0, deflexao: 0,
    alturaUtil: 28.5, vanFrente: 450, cotaCentro: 312.4,
    lt: 'LT 230kV Xingó - Craibas', voltage: '230kV',
    cadeiaCondutor: 'Cadeia de Suspensão 12 discos', qtdCadeias: 3,
    cadeiaParaRaios: 'Cadeia de Ancoragem 4 discos', qtdCadeiasPR: 1,
    estruturaCritica: true,
    status: 'concluido', observation: 'Torre terminal – entrada da SE Craibas',
    createdBy: 'u3', createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 's2', name: 'Torre 005', type: 'Suspensão', classe: 'MT2',
    coordX: -36.718, coordY: -9.400, lat: -9.400, lng: -36.718,
    progressiva: 1250, deflexao: 2.5,
    alturaUtil: 24.0, vanFrente: 380, cotaCentro: 298.1,
    lt: 'LT 230kV Xingó - Craibas', voltage: '230kV',
    cadeiaCondutor: 'Cadeia de Suspensão 10 discos', qtdCadeias: 3,
    cadeiaParaRaios: 'Cadeia de Suspensão 3 discos', qtdCadeiasPR: 1,
    estruturaCritica: false,
    status: 'em-andamento', observation: '',
    createdBy: 'u3', createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 's3', name: 'Torre 012', type: 'Ancoragem', classe: 'AT2',
    coordX: -36.738, coordY: -9.418, lat: -9.418, lng: -36.738,
    progressiva: 3100, deflexao: 15.3,
    alturaUtil: 32.0, vanFrente: 520, cotaCentro: 285.7,
    lt: 'LT 230kV Xingó - Craibas', voltage: '230kV',
    cadeiaCondutor: 'Cadeia de Ancoragem 14 discos', qtdCadeias: 3,
    cadeiaParaRaios: 'Cadeia de Ancoragem 5 discos', qtdCadeiasPR: 2,
    estruturaCritica: true,
    status: 'anomalia', observation: 'Flashover identificado na fase B',
    createdBy: 'u3', createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 's4', name: 'Torre 018', type: 'Suspensão', classe: 'MT1',
    coordX: -36.752, coordY: -9.432, lat: -9.432, lng: -36.752,
    progressiva: 4750, deflexao: 0,
    alturaUtil: 22.5, vanFrente: 420, cotaCentro: 271.3,
    lt: 'LT 230kV Xingó - Craibas', voltage: '230kV',
    cadeiaCondutor: 'Cadeia de Suspensão 10 discos', qtdCadeias: 3,
    cadeiaParaRaios: 'Cadeia de Suspensão 3 discos', qtdCadeiasPR: 1,
    estruturaCritica: false,
    status: 'atrasado', observation: 'Inspeção vencida',
    createdBy: 'u3', createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 's5', name: 'Torre 025', type: 'Transposição', classe: 'AT3',
    coordX: -36.763, coordY: -9.445, lat: -9.445, lng: -36.763,
    progressiva: 6200, deflexao: 0,
    alturaUtil: 36.0, vanFrente: 480, cotaCentro: 260.8,
    lt: 'LT 230kV Xingó - Craibas', voltage: '230kV',
    cadeiaCondutor: 'Cadeia de Transposição 12 discos', qtdCadeias: 6,
    cadeiaParaRaios: 'Cadeia de Ancoragem 5 discos', qtdCadeiasPR: 2,
    estruturaCritica: true,
    status: 'pendente', observation: '',
    createdBy: 'u3', createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 's6', name: 'Torre 031', type: 'Ângulo', classe: 'AT2',
    coordX: -36.772, coordY: -9.460, lat: -9.460, lng: -36.772,
    progressiva: 7800, deflexao: 22.7,
    alturaUtil: 30.5, vanFrente: 390, cotaCentro: 248.2,
    lt: 'LT 230kV Xingó - Craibas', voltage: '230kV',
    cadeiaCondutor: 'Cadeia de Ancoragem 13 discos', qtdCadeias: 3,
    cadeiaParaRaios: 'Cadeia de Ancoragem 5 discos', qtdCadeiasPR: 2,
    estruturaCritica: false,
    status: 'pendente', observation: '',
    createdBy: 'u3', createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 's7', name: 'Torre 038', type: 'Suspensão', classe: 'MT2',
    coordX: -36.785, coordY: -9.476, lat: -9.476, lng: -36.785,
    progressiva: 9500, deflexao: 1.2,
    alturaUtil: 24.0, vanFrente: 410, cotaCentro: 235.9,
    lt: 'LT 230kV Xingó - Craibas', voltage: '230kV',
    cadeiaCondutor: 'Cadeia de Suspensão 10 discos', qtdCadeias: 3,
    cadeiaParaRaios: 'Cadeia de Suspensão 3 discos', qtdCadeiasPR: 1,
    estruturaCritica: false,
    status: 'concluido', observation: '',
    createdBy: 'u3', createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 's8', name: 'Torre 045', type: 'Terminal', classe: 'AT1',
    coordX: -36.797, coordY: -9.490, lat: -9.490, lng: -36.797,
    progressiva: 11200, deflexao: 0,
    alturaUtil: 28.5, vanFrente: 0, cotaCentro: 221.5,
    lt: 'LT 230kV Xingó - Craibas', voltage: '230kV',
    cadeiaCondutor: 'Cadeia de Ancoragem 14 discos', qtdCadeias: 3,
    cadeiaParaRaios: 'Cadeia de Ancoragem 5 discos', qtdCadeiasPR: 1,
    estruturaCritica: true,
    status: 'pendente', observation: 'Torre terminal – entrada da SE Xingó',
    createdBy: 'u3', createdAt: '2026-01-10T08:00:00Z',
  },
];

function buildInitialInspection(): ComponentInspection[] {
  return INITIAL_INSPECTION_COMPONENTS.map((c) => ({
    componentId: c.id,
    componentName: c.name,
    status: 'pendente' as const,
    anomalies: [],
  }));
}

const INITIAL_ORDERS: ServiceOrder[] = [
  {
    id: 'os1', type: 'inspecao', structureId: 's2', technicianId: 'u1', supervisorId: 'u3',
    priority: 'alta', deadline: '2026-05-10', scheduledDate: '2026-05-07', status: 'pendente',
    createdAt: '2026-04-28T10:00:00Z', photos: [], activityLog: [],
  },
  {
    id: 'os2', type: 'execucao', structureId: 's3', technicianId: 'u1', supervisorId: 'u3',
    priority: 'alta', deadline: '2026-05-08', scheduledDate: '2026-05-06', status: 'pendente',
    createdAt: '2026-04-27T14:00:00Z',
    component: 'Isoladores', anomaly: 'Marcas de flashover / arco elétrico',
    description: 'Substituição de cadeia de isoladores danificados por flashover',
    details: 'Cadeia da fase B, posição 3ª a partir do topo. Substituir todos os discos da cadeia.',
    deadlineRules: 'Urgente – risco de desligamento.',
    supervisorNotes: 'Coordenar com o COL antes de iniciar. EPI completo obrigatório.',
    photos: [], activityLog: [],
  },
  {
    id: 'os3', type: 'inspecao', structureId: 's4', technicianId: 'u2', supervisorId: 'u3',
    priority: 'media', deadline: '2026-04-30', scheduledDate: '2026-04-29', status: 'pausado',
    createdAt: '2026-04-25T09:00:00Z', startedAt: '2026-04-29T07:30:00Z', pausedAt: '2026-04-29T12:00:00Z',
    photos: [],
    activityLog: [
      { timestamp: '2026-04-29T07:30:00Z', userId: 'u2', userName: 'Rafael Souza', action: 'Inspeção iniciada', details: 'Início da atividade em campo' },
      { timestamp: '2026-04-29T12:00:00Z', userId: 'u2', userName: 'Rafael Souza', action: 'Inspeção pausada', details: 'Pausa para almoço' },
    ],
    inspectionData: {
      currentComponentIndex: 4,
      components: buildInitialInspection().map((c, i) => {
        if (i < 4) return { ...c, status: 'ok' as const };
        return c;
      }),
    },
  },
  {
    id: 'os4', type: 'execucao', structureId: 's7', technicianId: 'u2', supervisorId: 'u3',
    priority: 'baixa', deadline: '2026-05-15', scheduledDate: '2026-05-10', status: 'pendente',
    createdAt: '2026-04-29T11:00:00Z',
    component: 'Faixa de Servidão', anomaly: 'Vegetação com altura inadequada na faixa',
    description: 'Limpeza da faixa de servidão – poda e supressão de vegetação',
    details: 'Vegetação arbórea com altura superior a 6m. Utilizar motosserra e roçadeira.',
    deadlineRules: 'Prazo de 10 dias. Não há necessidade de desligamento da LT.',
    supervisorNotes: 'Verificar acesso pelo ramal vicinal. Coordenar com proprietário rural.',
    photos: [], activityLog: [],
  },
  {
    id: 'os5', type: 'inspecao', structureId: 's5', technicianId: 'u1', supervisorId: 'u3',
    priority: 'media', deadline: '2026-05-12', scheduledDate: '2026-05-09', status: 'pendente',
    createdAt: '2026-04-30T08:00:00Z', photos: [], activityLog: [],
  },
];

// Registros de Inspeção iniciais (banco de inspeções)
const INITIAL_INSPECTION_RECORDS: InspectionRecord[] = [
  {
    id: 'insp1',
    orderId: 'os3',
    estruturaId: 's4',
    estruturaNome: 'Torre 018',
    supervisorId: 'u3',
    supervisorNome: 'André Lima',
    tecnicoId: 'u2',
    tecnicoNome: 'Rafael Souza',
    dataHoraAbertura: '2026-04-29T07:30:00Z',
    status: 'pausado',
    components: buildInitialInspection().map((c, i) => {
      if (i < 4) return { ...c, status: 'ok' as const };
      return c;
    }),
    historicoPausas: [
      {
        pausedAt: '2026-04-29T12:00:00Z',
        motivo: 'Pausa para almoço',
        userId: 'u2',
        userName: 'Rafael Souza',
      },
    ],
    photos: [],
  },
];

// Registros de Execução iniciais (banco de execuções)
const INITIAL_EXECUTION_RECORDS: ExecutionRecord[] = [
  {
    id: 'exec1',
    orderId: 'os2',
    estruturaId: 's3',
    estruturaNome: 'Torre 012',
    supervisorId: 'u3',
    supervisorNome: 'André Lima',
    tecnicoId: 'u1',
    tecnicoNome: 'Carlos Mendes',
    componente: 'Isoladores',
    anomalia: 'Marcas de flashover / arco elétrico',
    descricao: 'Substituição de cadeia de isoladores danificados por flashover',
    detalhes: 'Cadeia da fase B, posição 3ª a partir do topo. Substituir todos os discos.',
    prazoRegras: 'Urgente – risco de desligamento.',
    notasSupervisor: 'Coordenar com o COL antes de iniciar. EPI completo obrigatório.',
    dataHoraAbertura: '2026-04-27T14:00:00Z',
    status: 'pendente',
    historicoPausas: [],
    photos: [],
  },
];

// ─── Helpers de Storage ──────────────────────────────────────────────────────

export function getStore(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (!parsed.checklistComponents) parsed.checklistComponents = INITIAL_INSPECTION_COMPONENTS;
      if (!parsed.severities) parsed.severities = INITIAL_SEVERITY_OPTIONS;
      if (!parsed.systemLogs) parsed.systemLogs = generateInitialLogs();
      if (!parsed.logsLastReset) parsed.logsLastReset = new Date().toISOString();
      if (!parsed.inspectionRecords) parsed.inspectionRecords = [...INITIAL_INSPECTION_RECORDS];
      if (!parsed.executionRecords) parsed.executionRecords = [...INITIAL_EXECUTION_RECORDS];
      // Migrar estruturas antigas (lat/lng → coordX/coordY)
      parsed.structures = parsed.structures.map((s) => ({
        ...s,
        coordX: s.coordX ?? (s.lng ?? 0),
        coordY: s.coordY ?? (s.lat ?? 0),
      }));
      return parsed;
    }
  } catch {
    // corrompido – resetar
  }
  return getInitialData();
}

export function saveStore(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Fire-and-forget sync to backend for multi-user persistence
  fetch('/api/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: data }),
  }).catch(() => { /* backend unavailable — localStorage is the fallback */ });
}

/**
 * Loads the latest shared state from the backend and writes it to localStorage.
 * Must be called once on app startup before rendering any UI.
 * Falls back to localStorage silently if the backend is unavailable.
 */
export async function loadFromBackend(): Promise<void> {
  try {
    const res = await fetch('/api/state', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return;
    const { state, found } = await res.json();
    if (found && state) {
      const migrated: AppData = {
        ...getInitialData(),
        ...state,
        structures: ((state.structures ?? []) as Structure[]).map((s) => ({
          ...s,
          coordX: s.coordX ?? s.lng ?? 0,
          coordY: s.coordY ?? s.lat ?? 0,
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
  } catch {
    // Network error or timeout — continue with localStorage
  }
}

export function getInitialData(): AppData {
  return {
    users: INITIAL_USERS,
    structures: INITIAL_STRUCTURES,
    serviceOrders: INITIAL_ORDERS,
    activityLog: [],
    checklistComponents: INITIAL_INSPECTION_COMPONENTS,
    severities: INITIAL_SEVERITY_OPTIONS,
    inspectionRecords: [...INITIAL_INSPECTION_RECORDS],
    executionRecords: [...INITIAL_EXECUTION_RECORDS],
    systemLogs: generateInitialLogs(),
    logsLastReset: new Date().toISOString(),
  };
}

export function resetStore(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export function authenticate(email: string, password: string): SystemUser | null {
  const store = getStore();
  const user = store.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (user && user.status === 'active') {
    const now = new Date().toLocaleString('pt-BR');
    user.lastLogin = now;
    addSystemLog({
      level: 'success',
      module: 'Auth',
      message: `Login realizado: ${user.name} (${user.role})`,
      userId: user.id,
      userName: user.name,
    });
    saveStore(store);
    return user;
  }
  if (user && user.status === 'inactive') {
    addSystemLog({ level: 'warning', module: 'Auth', message: `Tentativa de login de usuário inativo: ${email}` });
  } else {
    addSystemLog({ level: 'warning', module: 'Auth', message: `Falha de login: ${email} não encontrado ou senha inválida` });
  }
  return null;
}

// ─── Ordens helpers ──────────────────────────────────────────────────────────

export function getOrdersByTechnician(technicianId: string): ServiceOrder[] {
  return getStore().serviceOrders.filter((o) => o.technicianId === technicianId);
}

export function getPendingOrders(technicianId: string): ServiceOrder[] {
  return getOrdersByTechnician(technicianId).filter((o) => o.status === 'pendente');
}

export function getActiveOrders(technicianId: string): ServiceOrder[] {
  return getOrdersByTechnician(technicianId).filter(
    (o) => o.status === 'em-andamento' || o.status === 'pausado'
  );
}

export function getStructureById(id: string): Structure | undefined {
  return getStore().structures.find((s) => s.id === id);
}

export function getUserById(id: string): SystemUser | undefined {
  return getStore().users.find((u) => u.id === id);
}

export function startOrder(orderId: string, userId: string, userName: string): ServiceOrder | null {
  const store = getStore();
  const order = store.serviceOrders.find((o) => o.id === orderId);
  if (!order) return null;

  const now = new Date().toISOString();
  const isFirstStart = !order.startedAt;
  order.status = 'em-andamento';
  order.startedAt = order.startedAt || now;
  order.resumedAt = now;

  if (order.type === 'inspecao' && !order.inspectionData) {
    const components = (store.checklistComponents ?? INITIAL_INSPECTION_COMPONENTS).map((c) => ({
      componentId: c.id,
      componentName: c.name,
      status: 'pendente' as const,
      anomalies: [],
    }));
    order.inspectionData = { currentComponentIndex: 0, components, startedAt: now };
  }

  if (!order.activityLog) order.activityLog = [];
  order.activityLog.push({
    timestamp: now,
    userId,
    userName,
    action: isFirstStart ? 'Ordem iniciada' : 'Ordem retomada',
    details: 'Status: em andamento',
  });

  // Sincronizar com banco de inspeções
  if (order.type === 'inspecao') {
    if (!store.inspectionRecords) store.inspectionRecords = [];
    let inspRec = store.inspectionRecords.find((r) => r.orderId === orderId);
    if (!inspRec) {
      const structure = store.structures.find((s) => s.id === order.structureId);
      const supervisor = store.users.find((u) => u.id === order.supervisorId);
      const technician = store.users.find((u) => u.id === userId);
      inspRec = {
        id: `insp_${generateId()}`,
        orderId,
        estruturaId: order.structureId,
        estruturaNome: structure?.name || order.structureId,
        supervisorId: order.supervisorId,
        supervisorNome: supervisor?.name || order.supervisorId,
        tecnicoId: userId,
        tecnicoNome: userName,
        dataHoraAbertura: now,
        status: 'em-andamento',
        components: (store.checklistComponents ?? INITIAL_INSPECTION_COMPONENTS).map((c) => ({
          componentId: c.id,
          componentName: c.name,
          status: 'pendente' as const,
          anomalies: [],
        })),
        historicoPausas: [],
        photos: [],
      };
      store.inspectionRecords.push(inspRec);
      order.inspectionRecordId = inspRec.id;
    } else {
      inspRec.status = 'em-andamento';
      // Registrar retomada nas pausas
      const lastPause = inspRec.historicoPausas[inspRec.historicoPausas.length - 1];
      if (lastPause && !lastPause.resumedAt) {
        lastPause.resumedAt = now;
      }
    }
  }

  // Sincronizar com banco de execuções
  if (order.type === 'execucao') {
    if (!store.executionRecords) store.executionRecords = [];
    let execRec = store.executionRecords.find((r) => r.orderId === orderId);
    if (!execRec) {
      const structure = store.structures.find((s) => s.id === order.structureId);
      const supervisor = store.users.find((u) => u.id === order.supervisorId);
      const technician = store.users.find((u) => u.id === userId);
      execRec = {
        id: `exec_${generateId()}`,
        orderId,
        estruturaId: order.structureId,
        estruturaNome: structure?.name || order.structureId,
        supervisorId: order.supervisorId,
        supervisorNome: supervisor?.name || order.supervisorId,
        tecnicoId: userId,
        tecnicoNome: userName,
        componente: order.component || '',
        anomalia: order.anomaly || '',
        descricao: order.description,
        detalhes: order.details,
        prazoRegras: order.deadlineRules,
        notasSupervisor: order.supervisorNotes,
        dataHoraAbertura: order.createdAt,
        dataHoraExecucaoInicio: now,
        status: 'em-andamento',
        historicoPausas: [],
        photos: [],
      };
      store.executionRecords.push(execRec);
      order.executionRecordId = execRec.id;
    } else {
      execRec.status = 'em-andamento';
      if (!execRec.dataHoraExecucaoInicio) execRec.dataHoraExecucaoInicio = now;
      const lastPause = execRec.historicoPausas[execRec.historicoPausas.length - 1];
      if (lastPause && !lastPause.resumedAt) {
        lastPause.resumedAt = now;
      }
    }
  }

  addSystemLog({ level: 'info', module: 'Ordens', message: `Ordem ${orderId} iniciada por ${userName}`, userId, userName });
  saveStore(store);
  return order;
}

export function pauseOrder(orderId: string, userId: string, userName: string, motivo?: string): ServiceOrder | null {
  const store = getStore();
  const order = store.serviceOrders.find((o) => o.id === orderId);
  if (!order) return null;

  const now = new Date().toISOString();
  order.status = 'pausado';
  order.pausedAt = now;

  if (!order.activityLog) order.activityLog = [];
  order.activityLog.push({
    timestamp: now, userId, userName,
    action: 'Ordem pausada',
    details: motivo || 'Pausado pelo técnico',
  });

  // Sincronizar pausa no banco de inspeções
  if (order.type === 'inspecao' && store.inspectionRecords) {
    const inspRec = store.inspectionRecords.find((r) => r.orderId === orderId);
    if (inspRec) {
      inspRec.status = 'pausado';
      inspRec.historicoPausas.push({ pausedAt: now, motivo, userId, userName });
    }
  }

  // Sincronizar pausa no banco de execuções
  if (order.type === 'execucao' && store.executionRecords) {
    const execRec = store.executionRecords.find((r) => r.orderId === orderId);
    if (execRec) {
      execRec.status = 'pausado';
      execRec.historicoPausas.push({ pausedAt: now, motivo, userId, userName });
    }
  }

  addSystemLog({ level: 'info', module: 'Ordens', message: `Ordem ${orderId} pausada por ${userName}`, userId, userName });
  saveStore(store);
  return order;
}

export function completeOrder(orderId: string, userId: string, userName: string): ServiceOrder | null {
  const store = getStore();
  const order = store.serviceOrders.find((o) => o.id === orderId);
  if (!order) return null;

  const now = new Date().toISOString();
  order.status = 'concluido';
  order.completedAt = now;
  if (order.inspectionData) order.inspectionData.completedAt = now;

  if (!order.activityLog) order.activityLog = [];
  order.activityLog.push({ timestamp: now, userId, userName, action: 'Ordem concluída', details: 'Atividade finalizada pelo técnico' });

  const structure = store.structures.find((s) => s.id === order.structureId);
  if (structure) {
    const hasAnomalies = order.inspectionData?.components.some((c) => c.status === 'anomalia');
    structure.status = hasAnomalies ? 'anomalia' : 'concluido';
  }

  // Sincronizar conclusão no banco de inspeções
  if (order.type === 'inspecao' && store.inspectionRecords) {
    const inspRec = store.inspectionRecords.find((r) => r.orderId === orderId);
    if (inspRec) {
      inspRec.status = 'concluido';
      inspRec.dataHoraFim = now;
      // Sincronizar componentes do inspectionData
      if (order.inspectionData) {
        inspRec.components = order.inspectionData.components;
      }
    }
  }

  // Sincronizar conclusão no banco de execuções
  if (order.type === 'execucao' && store.executionRecords) {
    const execRec = store.executionRecords.find((r) => r.orderId === orderId);
    if (execRec) {
      execRec.status = 'concluido';
      execRec.dataHoraExecucaoFim = now;
      execRec.dataHoraFim = now;
    }
  }

  addSystemLog({ level: 'success', module: 'Ordens', message: `Ordem ${orderId} concluída por ${userName}`, userId, userName });
  saveStore(store);
  return order;
}

export function saveInspectionProgress(orderId: string, inspectionData: InspectionData): void {
  const store = getStore();
  const order = store.serviceOrders.find((o) => o.id === orderId);
  if (!order) return;
  order.inspectionData = inspectionData;
  // Sincronizar progresso no InspectionRecord
  if (store.inspectionRecords) {
    const inspRec = store.inspectionRecords.find((r) => r.orderId === orderId);
    if (inspRec) {
      inspRec.components = inspectionData.components;
    }
  }
  saveStore(store);
}

export function addPhoto(orderId: string, photoBase64: string, componentId?: string, anomalyId?: string): void {
  const store = getStore();
  const order = store.serviceOrders.find((o) => o.id === orderId);
  if (!order) return;
  if (!order.photos) order.photos = [];
  order.photos.push(photoBase64);

  // Adicionar foto organizada no banco de inspeções/execuções
  const now = new Date().toISOString();
  const photoId = generateId();
  const newPhoto: InspectionPhoto = {
    id: photoId,
    inspectionId: order.inspectionRecordId || order.executionRecordId || orderId,
    componentId,
    anomalyId,
    dataBase64: photoBase64,
    timestamp: now,
    // Organização da pasta: inspections/{inspectionId}/components/{componentId}/
    storagePath: componentId
      ? `inspections/${order.inspectionRecordId || orderId}/components/${componentId}/${photoId}.jpg`
      : `inspections/${order.inspectionRecordId || orderId}/geral/${photoId}.jpg`,
  };

  if (order.type === 'inspecao' && store.inspectionRecords) {
    const inspRec = store.inspectionRecords.find((r) => r.orderId === orderId);
    if (inspRec) inspRec.photos.push(newPhoto);
  }
  if (order.type === 'execucao' && store.executionRecords) {
    const execRec = store.executionRecords.find((r) => r.orderId === orderId);
    if (execRec) execRec.photos.push(newPhoto);
  }

  saveStore(store);
}

// ─── Supervisor helpers ──────────────────────────────────────────────────────

export function addStructure(structure: Structure): void {
  const store = getStore();
  // Garantir coordX/coordY sincronizados com lat/lng
  structure.coordX = structure.coordX ?? structure.lng ?? 0;
  structure.coordY = structure.coordY ?? structure.lat ?? 0;
  structure.lat = structure.coordY;
  structure.lng = structure.coordX;
  store.structures.push(structure);
  addSystemLog({ level: 'info', module: 'Estruturas', message: `Nova estrutura criada: ${structure.name}` });
  saveStore(store);
}

export function updateStructure(updated: Structure): void {
  const store = getStore();
  updated.coordX = updated.coordX ?? updated.lng ?? 0;
  updated.coordY = updated.coordY ?? updated.lat ?? 0;
  updated.lat = updated.coordY;
  updated.lng = updated.coordX;
  const idx = store.structures.findIndex((s) => s.id === updated.id);
  if (idx >= 0) store.structures[idx] = updated;
  saveStore(store);
}

export function addServiceOrder(order: ServiceOrder): void {
  const store = getStore();
  store.serviceOrders.push(order);

  // Criar registro inicial no banco correspondente
  const structure = store.structures.find((s) => s.id === order.structureId);
  const supervisor = store.users.find((u) => u.id === order.supervisorId);
  const technician = store.users.find((u) => u.id === order.technicianId);

  if (order.type === 'execucao') {
    if (!store.executionRecords) store.executionRecords = [];
    const execRec: ExecutionRecord = {
      id: `exec_${generateId()}`,
      orderId: order.id,
      estruturaId: order.structureId,
      estruturaNome: structure?.name || order.structureId,
      supervisorId: order.supervisorId,
      supervisorNome: supervisor?.name || order.supervisorId,
      tecnicoId: order.technicianId,
      tecnicoNome: technician?.name || order.technicianId,
      componente: order.component || '',
      anomalia: order.anomaly || '',
      descricao: order.description,
      detalhes: order.details,
      prazoRegras: order.deadlineRules,
      notasSupervisor: order.supervisorNotes,
      dataHoraAbertura: order.createdAt,
      status: 'pendente',
      historicoPausas: [],
      photos: [],
    };
    store.executionRecords.push(execRec);
    order.executionRecordId = execRec.id;
  }

  addSystemLog({ level: 'info', module: 'Ordens', message: `Nova ordem criada: ${order.id} (${order.type})` });
  saveStore(store);
}

export function updateServiceOrder(updated: ServiceOrder): void {
  const store = getStore();
  const idx = store.serviceOrders.findIndex((o) => o.id === updated.id);
  if (idx >= 0) store.serviceOrders[idx] = updated;
  saveStore(store);
}

export function addUser(user: SystemUser): void {
  const store = getStore();
  store.users.push(user);
  addSystemLog({ level: 'info', module: 'Usuários', message: `Novo usuário criado: ${user.name} (${user.role})` });
  saveStore(store);
}

export function updateUser(updated: SystemUser): void {
  const store = getStore();
  const idx = store.users.findIndex((u) => u.id === updated.id);
  if (idx >= 0) store.users[idx] = updated;
  saveStore(store);
}

export function updateUserProfile(userId: string, updates: Partial<SystemUser>): void {
  const store = getStore();
  const idx = store.users.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    store.users[idx] = { ...store.users[idx], ...updates };
    saveStore(store);
  }
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Banco de Inspeções helpers ──────────────────────────────────────────────

export function getInspectionRecords(): InspectionRecord[] {
  return getStore().inspectionRecords ?? [];
}

export function getInspectionRecordById(id: string): InspectionRecord | undefined {
  return getStore().inspectionRecords?.find((r) => r.id === id);
}

export function getInspectionRecordByOrderId(orderId: string): InspectionRecord | undefined {
  return getStore().inspectionRecords?.find((r) => r.orderId === orderId);
}

export function updateInspectionRecord(updated: InspectionRecord): void {
  const store = getStore();
  if (!store.inspectionRecords) store.inspectionRecords = [];
  const idx = store.inspectionRecords.findIndex((r) => r.id === updated.id);
  if (idx >= 0) store.inspectionRecords[idx] = updated;
  else store.inspectionRecords.push(updated);
  saveStore(store);
}

export function deleteInspectionRecord(id: string): void {
  const store = getStore();
  if (!store.inspectionRecords) return;
  store.inspectionRecords = store.inspectionRecords.filter((r) => r.id !== id);
  saveStore(store);
}

// ─── Banco de Execuções helpers ──────────────────────────────────────────────

export function getExecutionRecords(): ExecutionRecord[] {
  return getStore().executionRecords ?? [];
}

export function getExecutionRecordById(id: string): ExecutionRecord | undefined {
  return getStore().executionRecords?.find((r) => r.id === id);
}

export function getExecutionRecordByOrderId(orderId: string): ExecutionRecord | undefined {
  return getStore().executionRecords?.find((r) => r.orderId === orderId);
}

export function updateExecutionRecord(updated: ExecutionRecord): void {
  const store = getStore();
  if (!store.executionRecords) store.executionRecords = [];
  const idx = store.executionRecords.findIndex((r) => r.id === updated.id);
  if (idx >= 0) store.executionRecords[idx] = updated;
  else store.executionRecords.push(updated);
  saveStore(store);
}

export function deleteExecutionRecord(id: string): void {
  const store = getStore();
  if (!store.executionRecords) return;
  store.executionRecords = store.executionRecords.filter((r) => r.id !== id);
  saveStore(store);
}

// ─── Checklist Component helpers ─────────────────────────────────────────────

export function getChecklistComponents(): ComponentRule[] {
  return getStore().checklistComponents ?? INITIAL_INSPECTION_COMPONENTS;
}

export function addChecklistComponent(component: ComponentRule): void {
  const store = getStore();
  if (!store.checklistComponents) store.checklistComponents = [...INITIAL_INSPECTION_COMPONENTS];
  store.checklistComponents.push(component);
  saveStore(store);
}

export function updateChecklistComponent(updated: ComponentRule): void {
  const store = getStore();
  if (!store.checklistComponents) store.checklistComponents = [...INITIAL_INSPECTION_COMPONENTS];
  const idx = store.checklistComponents.findIndex((c) => c.id === updated.id);
  if (idx >= 0) store.checklistComponents[idx] = updated;
  saveStore(store);
}

export function deleteChecklistComponent(id: string): void {
  const store = getStore();
  if (!store.checklistComponents) store.checklistComponents = [...INITIAL_INSPECTION_COMPONENTS];
  store.checklistComponents = store.checklistComponents.filter((c) => c.id !== id);
  saveStore(store);
}

// ─── Structure helpers ───────────────────────────────────────────────────────

export function deleteStructure(id: string): void {
  const store = getStore();
  store.structures = store.structures.filter((s) => s.id !== id);
  saveStore(store);
}

export function deleteServiceOrder(id: string): void {
  const store = getStore();
  store.serviceOrders = store.serviceOrders.filter((o) => o.id !== id);
  saveStore(store);
}

export function deleteUser(id: string): void {
  const store = getStore();
  store.users = store.users.filter((u) => u.id !== id);
  saveStore(store);
}

// ─── Severity helpers ────────────────────────────────────────────────────────

export function getSeverities(): SeverityOption[] {
  return getStore().severities ?? INITIAL_SEVERITY_OPTIONS;
}

export function addSeverity(sev: SeverityOption): void {
  const store = getStore();
  if (!store.severities) store.severities = [...INITIAL_SEVERITY_OPTIONS];
  store.severities.push(sev);
  addSystemLog({ level: 'info', module: 'Configurações', message: `Nova severidade adicionada: ${sev.label}` });
  saveStore(store);
}

export function updateSeverity(updated: SeverityOption): void {
  const store = getStore();
  if (!store.severities) store.severities = [...INITIAL_SEVERITY_OPTIONS];
  const idx = store.severities.findIndex((s) => s.id === updated.id);
  if (idx >= 0) store.severities[idx] = updated;
  saveStore(store);
}

export function deleteSeverity(id: string): void {
  const store = getStore();
  if (!store.severities) store.severities = [...INITIAL_SEVERITY_OPTIONS];
  store.severities = store.severities.filter((s) => s.id !== id);
  addSystemLog({ level: 'warning', module: 'Configurações', message: `Severidade removida: ${id}` });
  saveStore(store);
}

// ─── System Log helpers ──────────────────────────────────────────────────────

function generateInitialLogs(): SystemLog[] {
  const now = Date.now();
  return [
    { id: generateId(), timestamp: new Date(now - 3600000 * 5).toISOString(), level: 'success', module: 'Sistema', message: 'Sistema v2.2 inicializado com sucesso' },
    { id: generateId(), timestamp: new Date(now - 3600000 * 4).toISOString(), level: 'info', module: 'Auth', message: 'Login realizado: Administrador (superadm)', userId: 'u4', userName: 'Administrador' },
    { id: generateId(), timestamp: new Date(now - 3600000 * 3).toISOString(), level: 'info', module: 'Auth', message: 'Login realizado: André Lima (supervisor)', userId: 'u3', userName: 'André Lima' },
    { id: generateId(), timestamp: new Date(now - 3600000 * 2).toISOString(), level: 'info', module: 'Ordens', message: 'Nova ordem criada: os1 (inspecao)' },
    { id: generateId(), timestamp: new Date(now - 3600000 * 1).toISOString(), level: 'info', module: 'Auth', message: 'Login realizado: Carlos Mendes (tecnico)', userId: 'u1', userName: 'Carlos Mendes' },
    { id: generateId(), timestamp: new Date(now - 1800000).toISOString(), level: 'warning', module: 'Ordens', message: 'Ordem os3 pausada – prazo próximo do vencimento' },
    { id: generateId(), timestamp: new Date(now - 600000).toISOString(), level: 'info', module: 'Estruturas', message: 'Dados carregados: 8 estruturas, 2 inspeções, 1 execução' },
    { id: generateId(), timestamp: new Date(now - 300000).toISOString(), level: 'success', module: 'Storage', message: 'Bancos de dados sincronizados com sucesso' },
  ];
}

export function addSystemLog(entry: Omit<SystemLog, 'id' | 'timestamp'>): void {
  try {
    const store = getStore();
    if (!store.systemLogs) store.systemLogs = [];
    const lastReset = store.logsLastReset ? new Date(store.logsLastReset).getTime() : 0;
    if (Date.now() - lastReset > LOG_RESET_INTERVAL_MS) {
      store.systemLogs = [];
      store.logsLastReset = new Date().toISOString();
      store.systemLogs.push({
        id: generateId(),
        timestamp: new Date().toISOString(),
        level: 'info',
        module: 'Sistema',
        message: 'Logs resetados automaticamente (ciclo 24h)',
      });
    }
    store.systemLogs.push({ id: generateId(), timestamp: new Date().toISOString(), ...entry });
    if (store.systemLogs.length > 500) store.systemLogs = store.systemLogs.slice(-500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // silent fail
  }
}

export function getSystemLogs(): SystemLog[] {
  return (getStore().systemLogs ?? []).slice().reverse();
}

export function resetSystemLogs(): void {
  const store = getStore();
  store.systemLogs = [];
  store.logsLastReset = new Date().toISOString();
  store.systemLogs.push({
    id: generateId(),
    timestamp: new Date().toISOString(),
    level: 'info',
    module: 'Sistema',
    message: 'Logs resetados manualmente pelo administrador',
  });
  saveStore(store);
}

export function getLogsNextReset(): Date | null {
  const store = getStore();
  if (!store.logsLastReset) return null;
  return new Date(new Date(store.logsLastReset).getTime() + LOG_RESET_INTERVAL_MS);
}
