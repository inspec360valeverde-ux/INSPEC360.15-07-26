import { useState, useEffect, lazy, Suspense } from 'react';
import {
  LogOut,
  MapPin,
  BarChart3,
  ClipboardList,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  ChevronRight,
  Search,
  RefreshCw,
  Building2,
  FileText,
  Filter,
} from 'lucide-react';
import newLogo from '../../imports/Firefly_Gemini_Flash_recrie_a_imagem_com_qualidade_melhor__331567-1.png';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  getStore,
  addStructure,
  addServiceOrder,
  generateId,
} from '../data/store';
import type { Structure, ServiceOrder, StructureType } from '../data/types';
import type { User } from '../App';
import { CompletedOrdersTab } from './supervisor/CompletedOrdersTab';
import { ReportPanel } from './supervisor/ReportPanel';

const MapComponent = lazy(() =>
  import('./supervisor/MapComponent').then((m) => ({ default: m.MapComponent }))
);

interface SupervisorAppProps {
  user: User;
  onLogout: () => void;
}

type Tab = 'dashboard' | 'mapa' | 'ordens' | 'estruturas' | 'concluidas' | 'relatorio';

const STRUCTURE_TYPES: StructureType[] = [
  'Suspensão',
  'Ancoragem',
  'Transposição',
  'Terminal',
  'Ângulo',
  'Estaiada',
];

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: '#6b7280', bg: '#f3f4f6' },
  'em-andamento': { label: 'Em Andamento', color: '#AA8933', bg: '#fff8e1' },
  concluido: { label: 'Concluído', color: '#16a34a', bg: '#f0fdf4' },
  anomalia: { label: 'Anomalia', color: '#dc2626', bg: '#fef2f2' },
  atrasado: { label: 'Atrasado', color: '#ea580c', bg: '#fff7ed' },
};

const ORDER_STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: '#6b7280', bg: '#f3f4f6' },
  'em-andamento': { label: 'Em Andamento', color: '#AA8933', bg: '#fff8e1' },
  pausado: { label: 'Pausado', color: '#BCA55C', bg: '#fffde7' },
  concluido: { label: 'Concluído', color: '#16a34a', bg: '#f0fdf4' },
  cancelado: { label: 'Cancelado', color: '#6b7280', bg: '#f3f4f6' },
};

export function SupervisorApp({ user, onLogout }: SupervisorAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [structures, setStructures] = useState<Structure[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Map state
  const [isAddingStructure, setIsAddingStructure] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMapStructure, setSelectedMapStructure] = useState<Structure | null>(null);

  // Structure form
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [structureForm, setStructureForm] = useState({
    name: '',
    type: 'Suspensão' as StructureType,
    progressiva: '',
    lt: 'LT 230kV Xingó - Craibas',
    voltage: '230kV',
    notes: '',
  });

  // Order form
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedStructureIds, setSelectedStructureIds] = useState<string[]>([]);
  const [orderForm, setOrderForm] = useState({
    type: 'inspecao' as 'inspecao' | 'execucao',
    structureId: '',
    technicianId: '',
    priority: 'media' as 'alta' | 'media' | 'baixa',
    deadline: '',
    scheduledDate: '',
    component: '',
    anomaly: '',
    description: '',
    details: '',
    deadlineRules: '',
    supervisorNotes: '',
  });

  // Order detail view
  const [viewOrder, setViewOrder] = useState<ServiceOrder | null>(null);

  // Search
  const [orderSearch, setOrderSearch] = useState('');
  const [structureSearch, setStructureSearch] = useState('');

  // Report filters
  const [reportFilters, setReportFilters] = useState({
    dateFrom: '',
    dateTo: '',
    technicianId: '',
    orderType: 'all' as 'all' | 'inspecao' | 'execucao',
    status: 'all' as 'all' | 'pendente' | 'em-andamento' | 'pausado' | 'concluido' | 'cancelado',
    structureId: '',
  });
  const [showReport, setShowReport] = useState(false);

  function refresh() {
    const store = getStore();
    setStructures(store.structures);
    setOrders(store.serviceOrders);
    setTechnicians(
      store.users
        .filter((u) => u.role === 'tecnico' && u.status === 'active')
        .map((u) => ({ id: u.id, name: u.name }))
    );
  }

  useEffect(() => {
    refresh();
    const handleStorage = () => refresh();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (activeTab === 'mapa' || activeTab === 'estruturas' || activeTab === 'dashboard') {
      refresh();
    }
  }, [activeTab]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Map handlers ─────────────────────────────────────────────────────────────
  function handleMapClick(lat: number, lng: number) {
    if (!isAddingStructure) return;
    setPendingPin({ lat, lng });
    setShowStructureForm(true);
  }

  function handleAddStructureSubmit() {
    if (!pendingPin || !structureForm.name) return;
    const newStructure: Structure = {
      id: generateId(),
      name: structureForm.name,
      type: structureForm.type,
      progressiva: parseFloat(structureForm.progressiva) || 0,
      coordX: pendingPin.lng,
      coordY: pendingPin.lat,
      lat: pendingPin.lat,
      lng: pendingPin.lng,
      lt: structureForm.lt,
      voltage: structureForm.voltage,
      status: 'pendente',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      notes: structureForm.notes,
    };
    addStructure(newStructure);
    refresh();
    setIsAddingStructure(false);
    setPendingPin(null);
    setShowStructureForm(false);
    setStructureForm({
      name: '',
      type: 'Suspensão',
      progressiva: '',
      lt: 'LT 230kV Xingó - Craibas',
      voltage: '230kV',
      notes: '',
    });
    showToast(`Estrutura "${newStructure.name}" adicionada com sucesso!`);
  }

  // ── Order form ────────────────────────────────────────────────────────────────
  function handleAddOrder() {
    const structuresToProcess = selectedStructureIds.length > 0 
      ? selectedStructureIds 
      : (orderForm.structureId ? [orderForm.structureId] : []);

    if (structuresToProcess.length === 0 || !orderForm.technicianId || !orderForm.deadline) {
      showToast('Selecione estrutura(s), técnico e prazo.');
      return;
    }

    let createdCount = 0;
    structuresToProcess.forEach((structureId) => {
      const newOrder: ServiceOrder = {
        id: `os${generateId()}`,
        type: orderForm.type,
        structureId: structureId,
        technicianId: orderForm.technicianId,
        supervisorId: user.id,
        priority: orderForm.priority,
        deadline: orderForm.deadline,
        scheduledDate: orderForm.scheduledDate,
        status: 'pendente',
        createdAt: new Date().toISOString(),
        component: orderForm.component || undefined,
        anomaly: orderForm.anomaly || undefined,
        description: orderForm.description || undefined,
        details: orderForm.details || undefined,
        deadlineRules: orderForm.deadlineRules || undefined,
        supervisorNotes: orderForm.supervisorNotes || undefined,
        photos: [],
        activityLog: [],
      };
      addServiceOrder(newOrder);
      createdCount++;
    });

    refresh();
    setShowOrderForm(false);
    setSelectedStructureIds([]);
    setOrderForm({
      type: 'inspecao',
      structureId: '',
      technicianId: '',
      priority: 'media',
      deadline: '',
      scheduledDate: '',
      component: '',
      anomaly: '',
      description: '',
      details: '',
      deadlineRules: '',
      supervisorNotes: '',
    });

    const msg = createdCount === 1 
      ? 'Ordem de serviço criada com sucesso!' 
      : `${createdCount} ordens de serviço criadas com sucesso!`;
    showToast(msg);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function getStructureName(id: string) {
    return structures.find((s) => s.id === id)?.name || '—';
  }
  function getTechnicianName(id: string) {
    const store = getStore();
    return store.users.find((u) => u.id === id)?.name || '—';
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = {
    totalStructures: structures.length,
    anomalias: structures.filter((s) => s.status === 'anomalia').length,
    atrasados: orders.filter((o) => o.status !== 'concluido' && new Date(o.deadline) < new Date()).length,
    concluidos: orders.filter((o) => o.status === 'concluido').length,
    emAndamento: orders.filter((o) => o.status === 'em-andamento' || o.status === 'pausado').length,
    pendentes: orders.filter((o) => o.status === 'pendente').length,
  };

  const filteredOrders = orders.filter((o) => {
    const s = getStructureName(o.structureId).toLowerCase();
    const t = getTechnicianName(o.technicianId).toLowerCase();
    const q = orderSearch.toLowerCase();
    return s.includes(q) || t.includes(q) || o.id.toLowerCase().includes(q);
  });

  const filteredStructures = structures.filter((s) =>
    s.name.toLowerCase().includes(structureSearch.toLowerCase()) ||
    s.type.toLowerCase().includes(structureSearch.toLowerCase()) ||
    s.lt.toLowerCase().includes(structureSearch.toLowerCase())
  );

  // ── Order detail modal ────────────────────────────────────────────────────────
  if (viewOrder) {
    const structure = structures.find((s) => s.id === viewOrder.structureId);
    const techName = getTechnicianName(viewOrder.technicianId);
    const sCfg = ORDER_STATUS_CONFIG[viewOrder.status];

    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#193A2A' }}>
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
            <button onClick={() => setViewOrder(null)} className="text-white">
              <X className="w-6 h-6" />
            </button>
            <div className="flex-1 text-white text-sm">
              Detalhes da Ordem
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: sCfg.color }}
            >
              {sCfg.label}
            </span>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 max-w-2xl mx-auto w-full">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: viewOrder.type === 'inspecao' ? '#193A2A' : '#AA8933' }}
              >
                {viewOrder.type === 'inspecao' ? 'Inspeção' : 'Execução'}
              </span>
              <span className="text-xs text-gray-500">{viewOrder.id}</span>
            </div>

            {structure && (
              <div>
                <div className="text-xs text-gray-500">Estrutura</div>
                <div className="text-sm" style={{ color: '#193A2A' }}>{structure.name}</div>
                <div className="text-xs text-gray-500">{structure.type} – {structure.lt}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Técnico</div>
                <div className="text-sm">{techName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Prazo</div>
                <div className="text-sm">{new Date(viewOrder.deadline).toLocaleDateString('pt-BR')}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Prioridade</div>
                <div className="text-sm capitalize">{viewOrder.priority === 'alta' ? 'Alta' : viewOrder.priority === 'media' ? 'Média' : 'Baixa'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Criado em</div>
                <div className="text-sm">{new Date(viewOrder.createdAt).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
          </Card>

          {viewOrder.type === 'execucao' && (
            <Card className="p-4 space-y-3">
              <h3 className="text-sm" style={{ color: '#193A2A' }}>Detalhes do Serviço</h3>
              {viewOrder.component && <div><div className="text-xs text-gray-500">Componente</div><div className="text-sm">{viewOrder.component}</div></div>}
              {viewOrder.anomaly && <div><div className="text-xs text-gray-500">Anomalia</div><div className="text-sm">{viewOrder.anomaly}</div></div>}
              {viewOrder.description && <div><div className="text-xs text-gray-500">Descrição</div><div className="text-sm">{viewOrder.description}</div></div>}
              {viewOrder.details && <div><div className="text-xs text-gray-500">Detalhes Técnicos</div><div className="text-sm">{viewOrder.details}</div></div>}
              {viewOrder.deadlineRules && <div><div className="text-xs text-gray-500">Regras / Prazo</div><div className="text-sm">{viewOrder.deadlineRules}</div></div>}
              {viewOrder.supervisorNotes && <div><div className="text-xs text-gray-500">Observações Supervisor</div><div className="text-sm">{viewOrder.supervisorNotes}</div></div>}
            </Card>
          )}

          {viewOrder.type === 'inspecao' && viewOrder.inspectionData && (
            <Card className="p-4">
              <h3 className="text-sm mb-3" style={{ color: '#193A2A' }}>Resultado da Inspeção</h3>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-lg" style={{ color: '#16a34a' }}>
                    {viewOrder.inspectionData.components.filter((c) => c.status === 'ok').length}
                  </div>
                  <div className="text-xs text-gray-500">OK</div>
                </div>
                <div className="text-center">
                  <div className="text-lg" style={{ color: '#AA8933' }}>
                    {viewOrder.inspectionData.components.filter((c) => c.status === 'anomalia').length}
                  </div>
                  <div className="text-xs text-gray-500">Anomalias</div>
                </div>
                <div className="text-center">
                  <div className="text-lg text-gray-400">
                    {viewOrder.inspectionData.components.filter((c) => c.status === 'pendente').length}
                  </div>
                  <div className="text-xs text-gray-500">Pendentes</div>
                </div>
              </div>
              <div className="space-y-1">
                {viewOrder.inspectionData.components
                  .filter((c) => c.status === 'anomalia')
                  .map((comp) =>
                    comp.anomalies.map((a) => (
                      <div key={a.id} className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-700">{comp.componentName}:</span>{' '}
                          <span style={{ color: '#193A2A' }}>{a.anomalyName}</span>
                          {a.observation && <div className="text-gray-500">{a.observation}</div>}
                        </div>
                      </div>
                    ))
                  )}
              </div>
            </Card>
          )}

          {viewOrder.activityLog && viewOrder.activityLog.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm mb-3" style={{ color: '#193A2A' }}>Histórico</h3>
              <div className="space-y-2">
                {viewOrder.activityLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#AA8933' }} />
                    <div>
                      <span className="text-gray-700">{log.action}</span>
                      {log.details && <span className="text-gray-400"> – {log.details}</span>}
                      <div className="text-gray-400">{new Date(log.timestamp).toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {viewOrder.photos && viewOrder.photos.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm mb-3" style={{ color: '#193A2A' }}>Fotos de Evidência</h3>
              <div className="grid grid-cols-3 gap-2">
                {viewOrder.photos.map((p, i) => (
                  <img key={i} src={p} alt={`Foto ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 left-4 right-4 z-50 rounded-xl px-4 py-3 shadow-lg text-white text-sm text-center"
          style={{ backgroundColor: '#193A2A' }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 shadow-md" style={{ backgroundColor: '#193A2A' }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <img src={newLogo} alt="Logo" className="h-9 w-auto" />
          </div>
          <div className="flex-1 px-3">
            <div className="text-white text-xs opacity-75">Supervisor</div>
            <div className="text-white text-sm">{user.name}</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={refresh} className="text-white/70 hover:text-white p-1.5">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-white hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-white/10 max-w-3xl mx-auto overflow-x-auto">
          {(
            [
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'mapa', label: 'Mapa', icon: MapPin },
              { id: 'ordens', label: 'Ordens', icon: ClipboardList },
              { id: 'estruturas', label: 'Estruturas', icon: Building2 },
              { id: 'concluidas', label: 'Concluídas', icon: CheckCircle2 },
              { id: 'relatorio', label: 'Relatório', icon: FileText },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-all shrink-0"
                style={{
                  color: active ? '#AA8933' : 'rgba(255,255,255,0.6)',
                  borderBottom: active ? '2px solid #AA8933' : '2px solid transparent',
                  minWidth: '60px',
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Dashboard ──────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="p-4 space-y-4 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Estruturas', value: stats.totalStructures, icon: Building2, color: '#193A2A' },
                { label: 'Em Andamento', value: stats.emAndamento, icon: Clock, color: '#AA8933' },
                { label: 'Anomalias', value: stats.anomalias, icon: AlertTriangle, color: '#dc2626' },
                { label: 'Atrasados', value: stats.atrasados, icon: AlertTriangle, color: '#ea580c' },
                { label: 'Pendentes', value: stats.pendentes, icon: ClipboardList, color: '#6b7280' },
                { label: 'Concluídos', value: stats.concluidos, icon: CheckCircle2, color: '#16a34a' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 shrink-0" style={{ color: stat.color }} />
                      <div>
                        <div className="text-xl" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Quick access to completed orders */}
            {stats.concluidos > 0 && (
              <Card
                className="p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4"
                style={{ borderLeftColor: '#16a34a' }}
                onClick={() => setActiveTab('concluidas')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-800">{stats.concluidos} ordem{stats.concluidos !== 1 ? 's' : ''} concluída{stats.concluidos !== 1 ? 's' : ''}</div>
                      <div className="text-xs text-gray-400">Ver relatórios completos com fotos e dados</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </Card>
            )}

            {/* Recent orders */}
            <div>
              <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-1">
                Ordens Recentes
              </h2>
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => {
                  const cfg = ORDER_STATUS_CONFIG[order.status];
                  const isLate = order.status !== 'concluido' && new Date(order.deadline) < new Date();
                  return (
                    <Card
                      key={order.id}
                      className="p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setViewOrder(order)}
                    >
                      <div
                        className="w-2 h-12 rounded-full shrink-0"
                        style={{ backgroundColor: isLate ? '#ea580c' : cfg.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-gray-700 truncate">
                            {getStructureName(order.structureId)}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full text-white shrink-0"
                            style={{ backgroundColor: order.type === 'inspecao' ? '#193A2A' : '#AA8933' }}
                          >
                            {order.type === 'inspecao' ? 'INS' : 'EXE'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{getTechnicianName(order.technicianId)}</span>
                          <span>•</span>
                          <span>{new Date(order.deadline).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                        style={{ color: cfg.color, backgroundColor: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Structure statuses */}
            <div>
              <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-1">
                Status das Estruturas
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const count = structures.filter((s) => s.status === key).length;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2 p-3 rounded-xl"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                      <span className="text-xs text-gray-700 flex-1">{cfg.label}</span>
                      <span className="text-sm" style={{ color: cfg.color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Mapa ───────────────────────────────────────────────────────── */}
        {activeTab === 'mapa' && (
          <div className="flex flex-col h-[calc(100vh-110px)]">
            {/* Map toolbar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100 shadow-sm">
              <Button
                size="sm"
                className={`text-white ${isAddingStructure ? 'opacity-50' : ''}`}
                style={{ backgroundColor: isAddingStructure ? '#6b7280' : '#AA8933' }}
                onClick={() => {
                  setIsAddingStructure(!isAddingStructure);
                  if (isAddingStructure) {
                    setPendingPin(null);
                    setShowStructureForm(false);
                  }
                }}
              >
                {isAddingStructure ? (
                  <><X className="w-3.5 h-3.5 mr-1.5" />Cancelar</>
                ) : (
                  <><Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar Estrutura</>
                )}
              </Button>
              <div className="text-xs text-gray-500">
                {structures.length} estrutura(s) no mapa
              </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      Carregando mapa...
                    </div>
                  </div>
                }
              >
                <MapComponent
                  structures={structures}
                  onMapClick={handleMapClick}
                  pendingPin={pendingPin}
                  onStructureClick={setSelectedMapStructure}
                  isAddingMode={isAddingStructure}
                />
              </Suspense>

              {/* Selected structure info panel */}
              {selectedMapStructure && !isAddingStructure && (
                <div
                  className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-xl p-4 z-[1000]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm" style={{ color: '#193A2A' }}>
                        {selectedMapStructure.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {selectedMapStructure.type} – {selectedMapStructure.lt}
                      </div>
                      <div className="text-xs text-gray-500">
                        Progressiva: {selectedMapStructure.progressiva.toLocaleString('pt-BR')} m
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          color: STATUS_CONFIG[selectedMapStructure.status]?.color,
                          backgroundColor: STATUS_CONFIG[selectedMapStructure.status]?.bg,
                        }}
                      >
                        {STATUS_CONFIG[selectedMapStructure.status]?.label}
                      </span>
                      <button onClick={() => setSelectedMapStructure(null)}>
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3 text-white"
                    style={{ backgroundColor: '#193A2A' }}
                    onClick={() => {
                      setSelectedStructureIds([selectedMapStructure.id]);
                      setShowOrderForm(true);
                      setSelectedMapStructure(null);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Criar Ordem de Serviço
                  </Button>
                </div>
              )}
            </div>

            {/* Add structure form modal */}
            {showStructureForm && pendingPin && (
              <div className="fixed inset-0 z-[2000] flex items-end bg-black/50">
                <div className="w-full bg-white rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base" style={{ color: '#193A2A' }}>Nova Estrutura</h3>
                    <button onClick={() => { setShowStructureForm(false); setPendingPin(null); setIsAddingStructure(false); }}>
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="p-2 bg-green-50 rounded-lg text-xs text-green-700">
                    📍 Posição: {pendingPin.lat.toFixed(5)}°, {pendingPin.lng.toFixed(5)}°
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Nome da estrutura *</label>
                      <Input
                        placeholder="Ex: Torre 050"
                        value={structureForm.name}
                        onChange={(e) => setStructureForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Tipo de estrutura *</label>
                      <div className="flex flex-wrap gap-2">
                        {STRUCTURE_TYPES.map((t) => (
                          <button
                            key={t}
                            onClick={() => setStructureForm((f) => ({ ...f, type: t }))}
                            className="text-xs px-3 py-1.5 rounded-lg border-2 transition-all"
                            style={{
                              borderColor: structureForm.type === t ? '#AA8933' : '#e5e7eb',
                              color: structureForm.type === t ? '#AA8933' : '#6b7280',
                              backgroundColor: structureForm.type === t ? '#fff8e1' : '#fff',
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Progressiva (m)</label>
                      <Input
                        type="number"
                        placeholder="Ex: 12500"
                        value={structureForm.progressiva}
                        onChange={(e) => setStructureForm((f) => ({ ...f, progressiva: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Linha de Transmissão</label>
                      <Input
                        value={structureForm.lt}
                        onChange={(e) => setStructureForm((f) => ({ ...f, lt: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Tensão</label>
                        <Input
                          value={structureForm.voltage}
                          onChange={(e) => setStructureForm((f) => ({ ...f, voltage: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Observações</label>
                      <Textarea
                        placeholder="Notas sobre a estrutura..."
                        value={structureForm.notes}
                        onChange={(e) => setStructureForm((f) => ({ ...f, notes: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setShowStructureForm(false); setPendingPin(null); setIsAddingStructure(false); }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 text-white"
                      style={{ backgroundColor: '#193A2A' }}
                      onClick={handleAddStructureSubmit}
                      disabled={!structureForm.name}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Ordens ─────────────────────────────────────────────────────── */}
        {activeTab === 'ordens' && (
          <div className="p-4 space-y-3 max-w-3xl mx-auto">
            {/* Actions bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 text-sm"
                  placeholder="Buscar por estrutura, técnico..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
              <Button
                className="text-white shrink-0"
                style={{ backgroundColor: '#AA8933' }}
                onClick={() => {
                  setSelectedStructureIds([]);
                  setShowOrderForm(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Nova Ordem
              </Button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">Nenhuma ordem encontrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((order) => {
                  const cfg = ORDER_STATUS_CONFIG[order.status];
                  const isLate = order.status !== 'concluido' && new Date(order.deadline) < new Date();
                  return (
                    <Card
                      key={order.id}
                      className="overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setViewOrder(order)}
                    >
                      <div
                        className="h-1"
                        style={{ backgroundColor: isLate ? '#ea580c' : order.type === 'inspecao' ? '#193A2A' : '#AA8933' }}
                      />
                      <div className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: order.type === 'inspecao' ? '#193A2A' : '#AA8933' }}
                              >
                                {order.type === 'inspecao' ? 'INSPEÇÃO' : 'EXECUÇÃO'}
                              </span>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{ color: cfg.color, backgroundColor: cfg.bg }}
                              >
                                {cfg.label}
                              </span>
                              {isLate && (
                                <span className="text-[10px] text-red-500">⚠ Atrasado</span>
                              )}
                            </div>
                            <div className="text-sm" style={{ color: '#193A2A' }}>
                              {getStructureName(order.structureId)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {getTechnicianName(order.technicianId)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(order.deadline).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Estruturas ─────────────────────────────────────────────────── */}
        {activeTab === 'estruturas' && (
          <div className="p-4 space-y-3 max-w-3xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 text-sm"
                  placeholder="Buscar estruturas..."
                  value={structureSearch}
                  onChange={(e) => setStructureSearch(e.target.value)}
                />
              </div>
              <Button
                className="text-white shrink-0"
                style={{ backgroundColor: '#193A2A' }}
                onClick={() => { setActiveTab('mapa'); setIsAddingStructure(true); }}
              >
                <MapPin className="w-4 h-4 mr-1.5" />
                No Mapa
              </Button>
            </div>

            {filteredStructures.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">Nenhuma estrutura encontrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredStructures.map((s) => {
                  const cfg = STATUS_CONFIG[s.status];
                  return (
                    <Card key={s.id} className="p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: cfg.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm" style={{ color: '#193A2A' }}>{s.name}</div>
                              <div className="text-xs text-gray-500">{s.type} – {s.lt}</div>
                              <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                <span>Prog.: {s.progressiva.toLocaleString('pt-BR')} m</span>
                                <span>{s.voltage}</span>
                              </div>
                            </div>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                              style={{ color: cfg.color, backgroundColor: cfg.bg }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setSelectedStructureIds([s.id]);
                            setShowOrderForm(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Criar Ordem
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="px-3"
                          onClick={() => {
                            setActiveTab('mapa');
                          }}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Concluídas ─────────────────────────────────────────────────── */}
        {activeTab === 'concluidas' && (
          <CompletedOrdersTab
            orders={orders}
            structures={structures}
            technicians={technicians}
            getStructureName={getStructureName}
            getTechnicianName={getTechnicianName}
          />
        )}

        {/* ── Relatório ──────────────────────────────────────────────────── */}
        {activeTab === 'relatorio' && (
          <ReportPanel
            orders={orders}
            structures={structures}
            technicians={technicians}
            reportFilters={reportFilters}
            setReportFilters={setReportFilters}
            showReport={showReport}
            setShowReport={setShowReport}
            supervisorName={user.name}
            getStructureName={getStructureName}
            getTechnicianName={getTechnicianName}
          />
        )}
      </div>

      {/* ── New Order Form Modal ───────────────────────────────────────────── */}
      {showOrderForm && (
        <div className="fixed inset-0 z-[2000] flex items-end bg-black/50">
          <div className="w-full bg-white rounded-t-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base" style={{ color: '#193A2A' }}>Nova Ordem de Serviço</h3>
              <button onClick={() => setShowOrderForm(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Type selector */}
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Tipo *</label>
              <div className="flex gap-2">
                {(['inspecao', 'execucao'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderForm((f) => ({ ...f, type: t }))}
                    className="flex-1 py-2.5 rounded-xl border-2 text-sm transition-all"
                    style={{
                      borderColor: orderForm.type === t ? (t === 'inspecao' ? '#193A2A' : '#AA8933') : '#e5e7eb',
                      backgroundColor: orderForm.type === t ? (t === 'inspecao' ? '#193A2A' : '#AA8933') : '#fff',
                      color: orderForm.type === t ? '#fff' : '#6b7280',
                    }}
                  >
                    {t === 'inspecao' ? 'Inspeção' : 'Execução'}
                  </button>
                ))}
              </div>
            </div>

            {/* Structure - Multiple selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-600 block">Estrutura(s) *</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedStructureIds(structures.map(s => s.id))}
                    className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setSelectedStructureIds([])}
                    className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto bg-gray-50">
                {structures.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-4">Nenhuma estrutura cadastrada</div>
                ) : (
                  structures.map((s) => (
                    <label key={s.id} className="flex items-start gap-2 p-2 cursor-pointer hover:bg-white rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedStructureIds.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStructureIds([...selectedStructureIds, s.id]);
                          } else {
                            setSelectedStructureIds(selectedStructureIds.filter(id => id !== s.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-[#193A2A] focus:ring-[#193A2A] mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm" style={{ color: '#193A2A' }}>{s.name}</div>
                        <div className="text-xs text-gray-500">{s.type} – {s.lt}</div>
                        <div className="text-xs text-gray-400">Prog.: {s.progressiva.toLocaleString('pt-BR')} m • {s.voltage}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {selectedStructureIds.length > 0 && `${selectedStructureIds.length} estrutura(s) selecionada(s)`}
              </div>
            </div>

            {/* Technician */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Técnico *</label>
              <select
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#AA8933]"
                value={orderForm.technicianId}
                onChange={(e) => setOrderForm((f) => ({ ...f, technicianId: e.target.value }))}
              >
                <option value="">Selecionar técnico...</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Priority + dates */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Prioridade *</label>
                <select
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none"
                  value={orderForm.priority}
                  onChange={(e) => setOrderForm((f) => ({ ...f, priority: e.target.value as 'alta' | 'media' | 'baixa' }))}
                >
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Prazo *</label>
                <Input
                  type="date"
                  className="text-sm"
                  value={orderForm.deadline}
                  onChange={(e) => setOrderForm((f) => ({ ...f, deadline: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Execução</label>
                <Input
                  type="date"
                  className="text-sm"
                  value={orderForm.scheduledDate}
                  onChange={(e) => setOrderForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Execution-specific fields */}
            {orderForm.type === 'execucao' && (
              <>
                <div className="h-px bg-gray-100" />
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Detalhes do Serviço
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Componente</label>
                  <Input
                    placeholder="Ex: Isoladores, Cabos Condutores..."
                    value={orderForm.component}
                    onChange={(e) => setOrderForm((f) => ({ ...f, component: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Anomalia</label>
                  <Input
                    placeholder="Ex: Marcas de flashover, Rompimento de fios..."
                    value={orderForm.anomaly}
                    onChange={(e) => setOrderForm((f) => ({ ...f, anomaly: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Descrição do Serviço</label>
                  <Input
                    placeholder="Resumo do serviço a ser executado"
                    value={orderForm.description}
                    onChange={(e) => setOrderForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Detalhes Técnicos</label>
                  <Textarea
                    placeholder="Informações técnicas detalhadas para execução..."
                    value={orderForm.details}
                    onChange={(e) => setOrderForm((f) => ({ ...f, details: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Regras e Prazos</label>
                  <Textarea
                    placeholder="Normas aplicáveis, restrições, requisitos de segurança..."
                    value={orderForm.deadlineRules}
                    onChange={(e) => setOrderForm((f) => ({ ...f, deadlineRules: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Observações do Supervisor</label>
                  <Textarea
                    placeholder="Instruções adicionais para o técnico..."
                    value={orderForm.supervisorNotes}
                    onChange={(e) => setOrderForm((f) => ({ ...f, supervisorNotes: e.target.value }))}
                    rows={2}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pb-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowOrderForm(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 text-white"
                style={{ backgroundColor: '#193A2A' }}
                onClick={handleAddOrder}
              >
                Criar Ordem
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
