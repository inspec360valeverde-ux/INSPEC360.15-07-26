import { useState, useEffect } from 'react';
import {
  LogOut,
  Users,
  Settings,
  Shield,
  Activity,
  Plus,
  X,
  CheckCircle2,
  Edit2,
  Trash2,
  BarChart3,
  ClipboardList,
  Building2,
  AlertTriangle,
  ListChecks,
  ChevronDown,
  ChevronRight,
  MapPin,
  Terminal,
  RefreshCw,
  Database,
  Cpu,
  HardDrive,
} from 'lucide-react';
import newLogo from '../../imports/Firefly_Gemini_Flash_recrie_a_imagem_com_qualidade_melhor__331567-1.png';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  getStore,
  addUser,
  updateUser,
  deleteUser,
  generateId,
  resetStore,
  addChecklistComponent,
  updateChecklistComponent,
  deleteChecklistComponent,
  addStructure,
  updateStructure,
  deleteStructure,
  getSeverities,
  addSeverity,
  updateSeverity,
  deleteSeverity,
  getSystemLogs,
  resetSystemLogs,
  getLogsNextReset,
} from '../data/store';
import type { SystemUser, Structure, StructureType, StructureStatus, SeverityOption, SystemLog } from '../data/types';
import type { ComponentRule } from '../data/types';
import type { User } from '../App';
import { DatabasesPanel } from './superadm/DatabasesPanel';
import { BackupPanel } from './BackupPanel';
import { useAutoBackup } from '@/hooks/useAutoBackup';

interface SuperAdmAppProps {
  user: User;
  onLogout: () => void;
}

const ROLE_CONFIG = {
  tecnico: { label: 'Técnico', color: '#AA8933' },
  supervisor: { label: 'Supervisor', color: '#32473C' },
  superadm: { label: 'Super Admin', color: '#193A2A' },
};

const STRUCTURE_TYPES: StructureType[] = [
  'Suspensão', 'Ancoragem', 'Transposição', 'Terminal', 'Ângulo', 'Estaiada',
];

const STRUCTURE_STATUS_CONFIG: Record<StructureStatus, { label: string; color: string; bg: string }> = {
  pendente: { label: 'Pendente', color: '#6b7280', bg: '#f3f4f6' },
  'em-andamento': { label: 'Em Andamento', color: '#AA8933', bg: '#fff8e1' },
  concluido: { label: 'Concluído', color: '#16a34a', bg: '#f0fdf4' },
  anomalia: { label: 'Anomalia', color: '#dc2626', bg: '#fef2f2' },
  atrasado: { label: 'Atrasado', color: '#ea580c', bg: '#fff7ed' },
};

const COMPONENT_ICONS = ['🏗️', '🗼', '⚡', '🔌', '⛈️', '🔩', '🔋', '🚨', '🌿', '🔗', '📳', '↔️', '🔎', '⚙️', '🛡️', '📡'];

export function SuperAdmApp({ user, onLogout }: SuperAdmAppProps) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [activityItems, setActivityItems] = useState<{ text: string; time: string }[]>([]);
  const [checklistComponents, setChecklistComponents] = useState<ComponentRule[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showBackupPanel, setShowBackupPanel] = useState(false);

  // Habilitar backups automáticos
  useAutoBackup();

  // ── User form ──────────────────────────────────────────────────────────────
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tecnico' as 'tecnico' | 'supervisor' | 'superadm',
    status: 'active' as 'active' | 'inactive',
  });
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<SystemUser | null>(null);

  // ── Structure form ─────────────────────────────────────────────────────────
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState<Structure | null>(null);
  const [structureForm, setStructureForm] = useState({
    name: '',
    type: 'Suspensão' as StructureType,
    classe: '',
    coordX: 0,
    coordY: 0,
    progressiva: 0,
    deflexao: 0,
    alturaUtil: 0,
    vanFrente: 0,
    cotaCentro: 0,
    lt: '',
    voltage: '230kV',
    cadeiaCondutor: '',
    qtdCadeias: 3,
    cadeiaParaRaios: '',
    qtdCadeiasPR: 1,
    status: 'pendente' as StructureStatus,
    estruturaCritica: false,
    observation: '',
    notes: '',
  });
  const [confirmDeleteStructure, setConfirmDeleteStructure] = useState<Structure | null>(null);

  // ── Component rule form ────────────────────────────────────────────────────
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentRule | null>(null);
  const [componentForm, setComponentForm] = useState({
    name: '',
    icon: '🔎',
    description: '',
    anomalies: [] as string[],
  });
  const [newAnomalyText, setNewAnomalyText] = useState('');
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [confirmDeleteComponent, setConfirmDeleteComponent] = useState<ComponentRule | null>(null);
  const [editingAnomalyIdx, setEditingAnomalyIdx] = useState<{ compId: string; idx: number } | null>(null);
  const [editingAnomalyText, setEditingAnomalyText] = useState('');

  // ── Severity form ──────────────────────────────────────────────────────────
  const [severities, setSeverities] = useState<SeverityOption[]>([]);
  const [showSeverityForm, setShowSeverityForm] = useState(false);
  const [editingSeverity, setEditingSeverity] = useState<SeverityOption | null>(null);
  const [severityForm, setSeverityForm] = useState({ label: '', color: '#dc2626', description: '' });
  const [confirmDeleteSeverity, setConfirmDeleteSeverity] = useState<SeverityOption | null>(null);

  // ── Logs ──────────────────────────────────────────────────────────────────
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [logsNextReset, setLogsNextReset] = useState<Date | null>(null);
  const [logSearch, setLogSearch] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

  function refresh() {
    const store = getStore();
    setUsers(store.users);
    setStructures(store.structures);
    setOrderCount(store.serviceOrders.length);
    setChecklistComponents(store.checklistComponents ?? []);
    setSeverities(getSeverities());
    setSystemLogs(getSystemLogs());
    setLogsNextReset(getLogsNextReset());
    const activities = store.serviceOrders
      .filter((o) => o.activityLog && o.activityLog.length > 0)
      .flatMap((o) =>
        (o.activityLog || []).map((log) => ({
          text: `${log.userName}: ${log.action} – ${store.structures.find((s) => s.id === o.structureId)?.name || o.id}`,
          time: new Date(log.timestamp).toLocaleString('pt-BR'),
        }))
      )
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 20);
    setActivityItems(activities);
  }

  useEffect(() => { refresh(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── User handlers ──────────────────────────────────────────────────────────
  function openAddUser() {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'tecnico', status: 'active' });
    setShowUserForm(true);
  }

  function openEditUser(u: SystemUser) {
    setEditingUser(u);
    setUserForm({ name: u.name, email: u.email, password: u.password, role: u.role, status: u.status });
    setShowUserForm(true);
  }

  function handleSaveUser() {
    if (!userForm.name || !userForm.email || !userForm.password) {
      showToast('Preencha todos os campos obrigatórios.');
      return;
    }
    if (editingUser) {
      updateUser({ ...editingUser, ...userForm });
      showToast('Usuário atualizado com sucesso!');
    } else {
      addUser({ id: generateId(), ...userForm, lastLogin: '—' });
      showToast('Usuário criado com sucesso!');
    }
    refresh();
    setShowUserForm(false);
  }

  function handleDeleteUser(u: SystemUser) {
    deleteUser(u.id);
    refresh();
    setConfirmDeleteUser(null);
    showToast('Usuário excluído.');
  }

  function handleToggleUserStatus(u: SystemUser) {
    updateUser({ ...u, status: u.status === 'active' ? 'inactive' : 'active' });
    refresh();
    showToast(`Usuário ${u.status === 'active' ? 'desativado' : 'ativado'}.`);
  }

  // ── Structure handlers ─────────────────────────────────────────────────────
  function openAddStructure() {
    setEditingStructure(null);
    setStructureForm({
      name: '', type: 'Suspensão', classe: '',
      coordX: 0, coordY: 0,
      progressiva: 0, deflexao: 0, alturaUtil: 0, vanFrente: 0, cotaCentro: 0,
      lt: '', voltage: '230kV',
      cadeiaCondutor: '', qtdCadeias: 3, cadeiaParaRaios: '', qtdCadeiasPR: 1,
      status: 'pendente', estruturaCritica: false, observation: '', notes: '',
    });
    setShowStructureForm(true);
  }

  function openEditStructure(s: Structure) {
    setEditingStructure(s);
    setStructureForm({
      name: s.name, type: s.type, classe: s.classe || '',
      coordX: s.coordX ?? s.lng ?? 0, coordY: s.coordY ?? s.lat ?? 0,
      progressiva: s.progressiva, deflexao: s.deflexao ?? 0,
      alturaUtil: s.alturaUtil ?? 0, vanFrente: s.vanFrente ?? 0, cotaCentro: s.cotaCentro ?? 0,
      lt: s.lt, voltage: s.voltage,
      cadeiaCondutor: s.cadeiaCondutor || '', qtdCadeias: s.qtdCadeias ?? 3,
      cadeiaParaRaios: s.cadeiaParaRaios || '', qtdCadeiasPR: s.qtdCadeiasPR ?? 1,
      status: s.status, estruturaCritica: s.estruturaCritica ?? false,
      observation: s.observation || '', notes: s.notes || '',
    });
    setShowStructureForm(true);
  }

  function handleSaveStructure() {
    if (!structureForm.name || !structureForm.lt) {
      showToast('Preencha nome e linha de transmissão.');
      return;
    }
    const structureData = {
      ...structureForm,
      lat: structureForm.coordY,
      lng: structureForm.coordX,
    };
    if (editingStructure) {
      updateStructure({ ...editingStructure, ...structureData });
      showToast('Estrutura atualizada com sucesso!');
    } else {
      addStructure({
        id: generateId(),
        ...structureData,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      });
      showToast('Estrutura criada com sucesso!');
    }
    refresh();
    setShowStructureForm(false);
  }

  function handleDeleteStructure(s: Structure) {
    deleteStructure(s.id);
    refresh();
    setConfirmDeleteStructure(null);
    showToast('Estrutura excluída.');
  }

  // ── Component rule handlers ────────────────────────────────────────────────
  function openAddComponent() {
    setEditingComponent(null);
    setComponentForm({ name: '', icon: '🔎', description: '', anomalies: [] });
    setNewAnomalyText('');
    setShowComponentForm(true);
  }

  function openEditComponent(c: ComponentRule) {
    setEditingComponent(c);
    setComponentForm({ name: c.name, icon: c.icon, description: c.description, anomalies: [...c.anomalies] });
    setNewAnomalyText('');
    setShowComponentForm(true);
  }

  function handleSaveComponent() {
    if (!componentForm.name) { showToast('Informe o nome do componente.'); return; }
    const idSlug = componentForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (editingComponent) {
      updateChecklistComponent({ ...editingComponent, ...componentForm });
      showToast('Componente atualizado!');
    } else {
      addChecklistComponent({ id: `${idSlug}_${generateId()}`, ...componentForm });
      showToast('Componente criado!');
    }
    refresh();
    setShowComponentForm(false);
  }

  function handleDeleteComponent(c: ComponentRule) {
    deleteChecklistComponent(c.id);
    refresh();
    setConfirmDeleteComponent(null);
    showToast('Componente excluído.');
  }

  function addAnomalyToForm() {
    if (!newAnomalyText.trim()) return;
    setComponentForm((f) => ({ ...f, anomalies: [...f.anomalies, newAnomalyText.trim()] }));
    setNewAnomalyText('');
  }

  function removeAnomalyFromForm(idx: number) {
    setComponentForm((f) => ({ ...f, anomalies: f.anomalies.filter((_, i) => i !== idx) }));
  }

  // Inline anomaly edit directly on component list
  function handleInlineEditAnomaly(comp: ComponentRule, idx: number, value: string) {
    const updated = { ...comp, anomalies: comp.anomalies.map((a, i) => (i === idx ? value : a)) };
    updateChecklistComponent(updated);
    refresh();
    setEditingAnomalyIdx(null);
  }

  function handleInlineDeleteAnomaly(comp: ComponentRule, idx: number) {
    const updated = { ...comp, anomalies: comp.anomalies.filter((_, i) => i !== idx) };
    updateChecklistComponent(updated);
    refresh();
    showToast('Anomalia removida.');
  }

  function handleInlineAddAnomaly(comp: ComponentRule, text: string) {
    if (!text.trim()) return;
    const updated = { ...comp, anomalies: [...comp.anomalies, text.trim()] };
    updateChecklistComponent(updated);
    refresh();
    showToast('Anomalia adicionada.');
  }

  // ── Severity handlers ──────────────────────────────────────────────────────
  function openAddSeverity() {
    setEditingSeverity(null);
    setSeverityForm({ label: '', color: '#dc2626', description: '' });
    setShowSeverityForm(true);
  }

  function openEditSeverity(s: SeverityOption) {
    setEditingSeverity(s);
    setSeverityForm({ label: s.label, color: s.color, description: s.description });
    setShowSeverityForm(true);
  }

  function handleSaveSeverity() {
    if (!severityForm.label) { showToast('Informe o nome da severidade.'); return; }
    if (editingSeverity) {
      updateSeverity({ ...editingSeverity, ...severityForm });
      showToast('Severidade atualizada!');
    } else {
      const id = severityForm.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      addSeverity({ id: `${id}_${Date.now()}`, ...severityForm });
      showToast('Severidade criada!');
    }
    refresh();
    setShowSeverityForm(false);
  }

  function handleDeleteSeverity(s: SeverityOption) {
    deleteSeverity(s.id);
    refresh();
    setConfirmDeleteSeverity(null);
    showToast('Severidade excluída.');
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    tecnicos: users.filter((u) => u.role === 'tecnico').length,
    supervisores: users.filter((u) => u.role === 'supervisor').length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl px-6 py-3 shadow-lg text-white text-sm" style={{ backgroundColor: '#193A2A' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 shadow-md" style={{ backgroundColor: '#193A2A' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={newLogo} alt="Logo" className="h-11 w-auto" />
            <div className="text-white ml-1">
              <div className="text-sm opacity-90">Painel Administrativo</div>
              <div>{user.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowBackupPanel(true)} className="text-white hover:bg-white/10">
              <Database className="w-4 h-4 mr-2" />
              Backup
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 flex flex-wrap gap-1">
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-2" />Visão Geral</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Usuários</TabsTrigger>
            <TabsTrigger value="structures"><Building2 className="w-4 h-4 mr-2" />Estruturas</TabsTrigger>
            <TabsTrigger value="checklist"><ListChecks className="w-4 h-4 mr-2" />Regras de Inspeção</TabsTrigger>
            <TabsTrigger value="databases"><Database className="w-4 h-4 mr-2" />Bases de Dados</TabsTrigger>
            <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2" />Atividades</TabsTrigger>
            <TabsTrigger value="logs"><Terminal className="w-4 h-4 mr-2" />Logs</TabsTrigger>
            <TabsTrigger value="status"><Cpu className="w-4 h-4 mr-2" />Status</TabsTrigger>
            <TabsTrigger value="backup" onClick={() => setShowBackupPanel(true)}><HardDrive className="w-4 h-4 mr-2" />Backup</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Configurações</TabsTrigger>
          </TabsList>

          {/* ── Overview ──────────────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Usuários Ativos', value: stats.activeUsers, icon: Users, color: '#193A2A' },
                { label: 'Estruturas', value: structures.length, icon: Building2, color: '#32473C' },
                { label: 'Ordens de Serviço', value: orderCount, icon: ClipboardList, color: '#AA8933' },
                { label: 'Componentes de Inspeção', value: checklistComponents.length, icon: ListChecks, color: '#BCA55C' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-center gap-3">
                      <Icon className="w-8 h-8" style={{ color: stat.color }} />
                      <div>
                        <div className="text-2xl" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="p-6">
              <h2 className="text-lg mb-4" style={{ color: '#193A2A' }}>Distribuição de Perfis</h2>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
                  const count = users.filter((u) => u.role === role).length;
                  return (
                    <div key={role} className="text-center p-4 rounded-xl" style={{ backgroundColor: cfg.color + '15' }}>
                      <div className="text-3xl" style={{ color: cfg.color }}>{count}</div>
                      <div className="text-sm text-gray-600 mt-1">{cfg.label}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg mb-4" style={{ color: '#193A2A' }}>Últimas Atividades</h2>
              {activityItems.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma atividade registrada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {activityItems.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Activity className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#AA8933' }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">{item.text}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── Users ─────────────────────────────────────────────────────── */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: stats.totalUsers, color: '#193A2A' },
                { label: 'Ativos', value: stats.activeUsers, color: '#16a34a' },
                { label: 'Técnicos', value: stats.tecnicos, color: '#AA8933' },
                { label: 'Supervisores', value: stats.supervisores, color: '#32473C' },
              ].map((s) => (
                <Card key={s.label} className="p-4">
                  <div className="text-2xl" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-sm text-gray-600">{s.label}</div>
                </Card>
              ))}
            </div>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg" style={{ color: '#193A2A' }}>Gerenciar Usuários</h2>
                  <Button style={{ backgroundColor: '#AA8933' }} className="text-white" onClick={openAddUser}>
                    <Plus className="w-4 h-4 mr-2" />Adicionar Usuário
                  </Button>
                </div>
                <div className="space-y-3">
                  {users.map((u) => {
                    const roleCfg = ROLE_CONFIG[u.role];
                    return (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-medium" style={{ color: '#193A2A' }}>{u.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: roleCfg.color }}>{roleCfg.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                              {u.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">{u.email}</div>
                          <div className="text-xs text-gray-400">Último acesso: {u.lastLogin}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => openEditUser(u)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => handleToggleUserStatus(u)}
                            className={u.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}
                            title={u.status === 'active' ? 'Desativar' : 'Ativar'}
                          >
                            {u.status === 'active' ? <X className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setConfirmDeleteUser(u)}
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── Structures ────────────────────────────────────────────────── */}
          <TabsContent value="structures" className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg" style={{ color: '#193A2A' }}>Gerenciar Estruturas</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{structures.length} estrutura(s) cadastrada(s)</p>
                  </div>
                  <Button style={{ backgroundColor: '#AA8933' }} className="text-white" onClick={openAddStructure}>
                    <Plus className="w-4 h-4 mr-2" />Nova Estrutura
                  </Button>
                </div>

                <div className="space-y-3">
                  {structures.map((s) => {
                    const stCfg = STRUCTURE_STATUS_CONFIG[s.status];
                    return (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#193A2A' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium" style={{ color: '#193A2A' }}>{s.name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: stCfg.bg, color: stCfg.color }}>{stCfg.label}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">{s.type}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-0.5">{s.lt} · {s.voltage}</div>
                            <div className="text-xs text-gray-400">Progressiva: {s.progressiva.toLocaleString()}m · X: {s.coordX?.toFixed(5) ?? s.lng} · Y: {s.coordY?.toFixed(5) ?? s.lat}{s.estruturaCritica && <span className="text-red-500 ml-1">⚠ Crítica</span>}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => openEditStructure(s)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setConfirmDeleteStructure(s)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {structures.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                      <p className="text-sm">Nenhuma estrutura cadastrada.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── Checklist Rules ───────────────────────────────────────────── */}
          <TabsContent value="checklist" className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg" style={{ color: '#193A2A' }}>Componentes e Regras de Validação</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {checklistComponents.length} componente(s) · {checklistComponents.reduce((s, c) => s + c.anomalies.length, 0)} anomalia(s) cadastrada(s)
                    </p>
                  </div>
                  <Button style={{ backgroundColor: '#AA8933' }} className="text-white" onClick={openAddComponent}>
                    <Plus className="w-4 h-4 mr-2" />Novo Componente
                  </Button>
                </div>

                <div className="space-y-3">
                  {checklistComponents.map((comp) => {
                    const isExpanded = expandedComponent === comp.id;
                    return (
                      <div key={comp.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Component header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                          <button
                            className="flex items-center gap-3 flex-1 text-left"
                            onClick={() => setExpandedComponent(isExpanded ? null : comp.id)}
                          >
                            <span className="text-xl">{comp.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm" style={{ color: '#193A2A' }}>{comp.name}</div>
                              <div className="text-xs text-gray-500 truncate">{comp.description}</div>
                            </div>
                            <span className="text-xs text-gray-400 mr-2">{comp.anomalies.length} anomalia(s)</span>
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                          </button>
                          <div className="flex items-center gap-1 ml-2">
                            <Button variant="outline" size="sm" onClick={() => openEditComponent(comp)} title="Editar componente">
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setConfirmDeleteComponent(comp)} title="Excluir componente">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded: anomaly list */}
                        {isExpanded && (
                          <div className="px-4 py-3 space-y-2 bg-white">
                            <p className="text-xs text-gray-500 mb-2">Anomalias / Validações deste componente:</p>
                            {comp.anomalies.map((anomaly, idx) => (
                              <div key={idx} className="flex items-center gap-2 group">
                                {editingAnomalyIdx?.compId === comp.id && editingAnomalyIdx.idx === idx ? (
                                  <>
                                    <Input
                                      value={editingAnomalyText}
                                      onChange={(e) => setEditingAnomalyText(e.target.value)}
                                      className="flex-1 text-sm h-8"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleInlineEditAnomaly(comp, idx, editingAnomalyText);
                                        if (e.key === 'Escape') setEditingAnomalyIdx(null);
                                      }}
                                      autoFocus
                                    />
                                    <Button size="sm" className="text-white h-8 px-3" style={{ backgroundColor: '#193A2A' }}
                                      onClick={() => handleInlineEditAnomaly(comp, idx, editingAnomalyText)}>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => setEditingAnomalyIdx(null)}>
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex-1 text-sm bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                                      {anomaly}
                                    </div>
                                    <Button variant="outline" size="sm" className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => { setEditingAnomalyIdx({ compId: comp.id, idx }); setEditingAnomalyText(anomaly); }}
                                      title="Editar anomalia">
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-7 px-2 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleInlineDeleteAnomaly(comp, idx)}
                                      title="Excluir anomalia">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ))}

                            {/* Add new anomaly inline */}
                            <InlineAnomalyAdder
                              onAdd={(text) => handleInlineAddAnomaly(comp, text)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {checklistComponents.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <ListChecks className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                      <p className="text-sm">Nenhum componente de inspeção cadastrado.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── Databases ─────────────────────────────────────────────────── */}
          <TabsContent value="databases" className="mt-0">
            <DatabasesPanel onRefresh={refresh} />
          </TabsContent>

          {/* ── Activity ──────────────────────────────────────────────────── */}
          <TabsContent value="activity" className="mt-0">
            <Card className="p-6">
              <h2 className="text-lg mb-4" style={{ color: '#193A2A' }}>Log de Atividades do Sistema</h2>
              {activityItems.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">Nenhuma atividade registrada ainda.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activityItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Activity className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#AA8933' }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800">{item.text}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── System Logs ───────────────────────────────────────────────── */}
          <TabsContent value="logs" className="mt-0">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg" style={{ color: '#193A2A' }}>Logs Reais do Sistema</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {systemLogs.length} entradas · Reset: {logsNextReset ? logsNextReset.toLocaleString('pt-BR') : '—'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { refresh(); showToast('Logs atualizados.'); }}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />Atualizar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50"
                    onClick={() => { if (confirm('Limpar logs?')) { resetSystemLogs(); refresh(); } }}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" />Limpar
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                <input type="text" placeholder="Buscar nos logs..." value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="flex-1 min-w-48 text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#AA8933]" />
                <div className="flex gap-1 flex-wrap">
                  {(['all', 'info', 'success', 'warning', 'error'] as const).map((lvl) => {
                    const c: Record<string,string> = { all:'#6b7280',info:'#2563eb',success:'#16a34a',warning:'#AA8933',error:'#dc2626' };
                    return (
                      <button key={lvl} onClick={() => setLogLevelFilter(lvl)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border transition-all"
                        style={{ borderColor: logLevelFilter===lvl?c[lvl]:'#e5e7eb', backgroundColor: logLevelFilter===lvl?c[lvl]+'15':'#fff', color: logLevelFilter===lvl?c[lvl]:'#6b7280' }}>
                        {lvl==='all'?'Todos':lvl.charAt(0).toUpperCase()+lvl.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1 max-h-[55vh] overflow-y-auto font-mono text-xs">
                {systemLogs.filter(log => {
                  const matchLevel = logLevelFilter==='all'||log.level===logLevelFilter;
                  const q = logSearch.toLowerCase();
                  return matchLevel&&(!q||log.message.toLowerCase().includes(q)||log.module.toLowerCase().includes(q));
                }).map(log => {
                  const cfg: Record<string,{color:string;bg:string;sym:string}> = {
                    info:{color:'#2563eb',bg:'#eff6ff',sym:'ℹ'},
                    success:{color:'#16a34a',bg:'#f0fdf4',sym:'✓'},
                    warning:{color:'#AA8933',bg:'#fff8e1',sym:'⚠'},
                    error:{color:'#dc2626',bg:'#fef2f2',sym:'✗'},
                  };
                  const c = cfg[log.level]??cfg.info;
                  return (
                    <div key={log.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="w-5 h-5 rounded text-white flex items-center justify-center shrink-0 mt-0.5 text-[11px]" style={{backgroundColor:c.color}}>{c.sym}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                          <span className="px-1 py-0.5 rounded text-[10px]" style={{backgroundColor:c.bg,color:c.color}}>[{log.module}]</span>
                        </div>
                        <div className="text-gray-800 mt-0.5">{log.message}</div>
                        {log.userName && <div className="text-gray-400">por: {log.userName}</div>}
                      </div>
                    </div>
                  );
                })}
                {systemLogs.length===0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Terminal className="w-12 h-12 mx-auto mb-3 text-gray-200"/>
                    <p className="text-sm">Nenhum log registrado.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ── System Status ─────────────────────────────────────────────── */}
          <TabsContent value="status" className="mt-0">
            <SystemStatusPanel structures={structures} users={users} orderCount={orderCount} checklistComponents={checklistComponents} />
          </TabsContent>

          {/* ── Settings ──────────────────────────────────────────────────── */}
          <TabsContent value="settings" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h2 className="text-lg" style={{ color: '#193A2A' }}>Configurações do Sistema</h2>
                <div>
                  <h3 className="font-medium mb-2" style={{ color: '#193A2A' }}>Modo Offline (PWA)</h3>
                  <p className="text-sm text-gray-600 mb-2">Sistema configurado para funcionar offline no campo. Dados sincronizados via localStorage.</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-green-700">Storage ativo</span>
                  </div>
                </div>

                {/* Severity Management */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium" style={{ color: '#193A2A' }}>Níveis de Severidade ({severities.length})</h3>
                    <Button size="sm" style={{ backgroundColor: '#AA8933' }} className="text-white text-xs" onClick={openAddSeverity}>
                      <Plus className="w-3.5 h-3.5 mr-1" />Nova
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {severities.map(sev => (
                      <div key={sev.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                        <div className="w-4 h-4 rounded-full shrink-0" style={{backgroundColor:sev.color}} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm" style={{color:'#193A2A'}}>{sev.label}</div>
                          <div className="text-xs text-gray-500 truncate">{sev.description}</div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={()=>openEditSeverity(sev)}><Edit2 className="w-3 h-3"/></Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={()=>setConfirmDeleteSeverity(sev)}><Trash2 className="w-3 h-3"/></Button>
                        </div>
                      </div>
                    ))}
                    {severities.length===0 && <p className="text-xs text-gray-400">Nenhuma severidade.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2" style={{ color: '#193A2A' }}>Paleta de Cores da Marca</h3>
                  <div className="flex gap-2 flex-wrap">
                    {['#193A2A', '#32473C', '#AA8933', '#BCA55C', '#000000', '#FFFFFF'].map((color) => (
                      <div key={color} className="w-12 h-12 rounded-lg border border-gray-200 flex items-end justify-center pb-1" style={{ backgroundColor: color }}>
                        <span className={`text-[8px] ${color === '#FFFFFF' ? 'text-gray-400' : 'text-white'} opacity-80`}>{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h2 className="text-lg" style={{ color: '#193A2A' }}>Dados do Sistema</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Usuários cadastrados', value: users.length },
                    { label: 'Estruturas cadastradas', value: structures.length },
                    { label: 'Ordens de serviço', value: orderCount },
                    { label: 'Componentes de inspeção', value: checklistComponents.length },
                    { label: 'Total de validações', value: checklistComponents.reduce((s, c) => s + c.anomalies.length, 0) },
                    { label: 'Níveis de severidade', value: severities.length },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="font-medium" style={{ color: '#193A2A' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <h3 className="font-medium mb-2 text-red-600">Zona de Perigo</h3>
                  <p className="text-xs text-gray-500 mb-3">Redefinir todos os dados para o estado inicial (dados de demonstração).</p>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 w-full"
                    onClick={() => {
                      if (confirm('Tem certeza? Todos os dados serão redefinidos para o estado inicial.')) {
                        resetStore();
                        refresh();
                        showToast('Dados redefinidos com sucesso.');
                      }
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Redefinir Dados do Sistema
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Backup Panel ─────────────────────────────────────────────────────── */}
      {showBackupPanel && <BackupPanel onClose={() => setShowBackupPanel(false)} />}

      {/* ── User Form Modal ────────────────────────────────────────────────── */}
      {showUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg" style={{ color: '#193A2A' }}>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => setShowUserForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Nome completo *</label>
                <Input value={userForm.name} onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome do usuário" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">E-mail *</label>
                <Input type="email" value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@inspec360.com" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Senha *</label>
                <Input type="password" value={userForm.password} onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Perfil *</label>
                <div className="flex gap-2">
                  {(['tecnico', 'supervisor', 'superadm'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserForm((f) => ({ ...f, role }))}
                      className="flex-1 text-xs py-2 rounded-lg border-2 transition-all"
                      style={{
                        borderColor: userForm.role === role ? ROLE_CONFIG[role].color : '#e5e7eb',
                        backgroundColor: userForm.role === role ? ROLE_CONFIG[role].color + '20' : '#fff',
                        color: userForm.role === role ? ROLE_CONFIG[role].color : '#6b7280',
                      }}
                    >{ROLE_CONFIG[role].label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Status</label>
                <div className="flex gap-2">
                  {(['active', 'inactive'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setUserForm((f) => ({ ...f, status: s }))}
                      className="flex-1 text-xs py-2 rounded-lg border-2 transition-all"
                      style={{
                        borderColor: userForm.status === s ? (s === 'active' ? '#16a34a' : '#dc2626') : '#e5e7eb',
                        backgroundColor: userForm.status === s ? (s === 'active' ? '#f0fdf4' : '#fef2f2') : '#fff',
                        color: userForm.status === s ? (s === 'active' ? '#16a34a' : '#dc2626') : '#6b7280',
                      }}
                    >{s === 'active' ? 'Ativo' : 'Inativo'}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowUserForm(false)}>Cancelar</Button>
              <Button className="flex-1 text-white" style={{ backgroundColor: '#193A2A' }} onClick={handleSaveUser}>
                {editingUser ? 'Salvar' : 'Criar Usuário'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Structure Form Modal ───────────────────────────────────────────── */}
      {showStructureForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg" style={{ color: '#193A2A' }}>{editingStructure ? 'Editar Estrutura' : 'Nova Estrutura'}</h3>
              <button onClick={() => setShowStructureForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {/* Identificação */}
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Identificação
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-gray-600 mb-1 block">Nome *</label>
                  <Input value={structureForm.name} onChange={(e) => setStructureForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Torre 001" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-600 mb-1 block">Linha de Transmissão *</label>
                  <Input value={structureForm.lt} onChange={(e) => setStructureForm((f) => ({ ...f, lt: e.target.value }))} placeholder="Ex: LT 230kV Xingó - Craibas" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Tipo</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={structureForm.type} onChange={(e) => setStructureForm((f) => ({ ...f, type: e.target.value as StructureType }))}>
                    {STRUCTURE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Classe</label>
                  <Input value={structureForm.classe} onChange={(e) => setStructureForm((f) => ({ ...f, classe: e.target.value }))} placeholder="Ex: MT2, AT3" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Tensão</label>
                  <Input value={structureForm.voltage} onChange={(e) => setStructureForm((f) => ({ ...f, voltage: e.target.value }))} placeholder="Ex: 230kV" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Status</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={structureForm.status} onChange={(e) => setStructureForm((f) => ({ ...f, status: e.target.value as StructureStatus }))}>
                    {Object.entries(STRUCTURE_STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Coordenadas */}
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Coordenadas Geográficas
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Coord. X (Longitude)</label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={structureForm.coordX === 0 ? '' : String(structureForm.coordX)}
                    onChange={(e) => setStructureForm((f) => ({ ...f, coordX: parseFloat(e.target.value) || 0 }))}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      const parts = text.trim().split(/[\s,;]+/).filter(Boolean);
                      if (parts.length >= 2) {
                        const a = parseFloat(parts[0]);
                        const b = parseFloat(parts[1]);
                        if (!isNaN(a) && !isNaN(b)) {
                          e.preventDefault();
                          setStructureForm((f) => ({ ...f, coordY: a, coordX: b }));
                        }
                      }
                    }}
                    placeholder="-36.71800"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Coord. Y (Latitude)</label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={structureForm.coordY === 0 ? '' : String(structureForm.coordY)}
                    onChange={(e) => setStructureForm((f) => ({ ...f, coordY: parseFloat(e.target.value) || 0 }))}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      const parts = text.trim().split(/[\s,;]+/).filter(Boolean);
                      if (parts.length >= 2) {
                        const a = parseFloat(parts[0]);
                        const b = parseFloat(parts[1]);
                        if (!isNaN(a) && !isNaN(b)) {
                          e.preventDefault();
                          setStructureForm((f) => ({ ...f, coordY: a, coordX: b }));
                        }
                      }
                    }}
                    placeholder="-9.40000"
                  />
                </div>
              </div>
            </div>

            {/* Métricas Técnicas */}
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Métricas Técnicas</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Progressiva (m)</label>
                  <Input type="number" value={structureForm.progressiva} onChange={(e) => setStructureForm((f) => ({ ...f, progressiva: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Deflexão (°)</label>
                  <Input type="number" step="0.1" value={structureForm.deflexao} onChange={(e) => setStructureForm((f) => ({ ...f, deflexao: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Altura Útil (m)</label>
                  <Input type="number" step="0.1" value={structureForm.alturaUtil} onChange={(e) => setStructureForm((f) => ({ ...f, alturaUtil: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Vão à Frente (m)</label>
                  <Input type="number" step="0.1" value={structureForm.vanFrente} onChange={(e) => setStructureForm((f) => ({ ...f, vanFrente: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Cota Centro (m)</label>
                  <Input type="number" step="0.1" value={structureForm.cotaCentro} onChange={(e) => setStructureForm((f) => ({ ...f, cotaCentro: Number(e.target.value) }))} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={structureForm.estruturaCritica} onChange={(e) => setStructureForm((f) => ({ ...f, estruturaCritica: e.target.checked }))} className="w-4 h-4 accent-red-600" />
                    <span className="text-xs text-red-600 font-medium">Estrutura Crítica</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Cadeias */}
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Cadeias</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Cadeia de Condutor</label>
                  <Input value={structureForm.cadeiaCondutor} onChange={(e) => setStructureForm((f) => ({ ...f, cadeiaCondutor: e.target.value }))} placeholder="Ex: Cadeia de Suspensão 12 discos" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Qtd. Cadeias</label>
                  <Input type="number" value={structureForm.qtdCadeias} onChange={(e) => setStructureForm((f) => ({ ...f, qtdCadeias: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Cadeia Para-raios</label>
                  <Input value={structureForm.cadeiaParaRaios} onChange={(e) => setStructureForm((f) => ({ ...f, cadeiaParaRaios: e.target.value }))} placeholder="Ex: Cadeia de Ancoragem 4 discos" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Qtd. Cadeias PR</label>
                  <Input type="number" value={structureForm.qtdCadeiasPR} onChange={(e) => setStructureForm((f) => ({ ...f, qtdCadeiasPR: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            {/* Observação */}
            <div className="mb-4">
              <label className="text-xs text-gray-600 mb-1 block">Observação</label>
              <Textarea value={structureForm.observation} onChange={(e) => setStructureForm((f) => ({ ...f, observation: e.target.value }))} rows={2} placeholder="Observações técnicas sobre esta estrutura..." />
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button variant="outline" className="flex-1" onClick={() => setShowStructureForm(false)}>Cancelar</Button>
              <Button className="flex-1 text-white" style={{ backgroundColor: '#193A2A' }} onClick={handleSaveStructure}>
                {editingStructure ? 'Salvar' : 'Criar Estrutura'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Component Rule Form Modal ──────────────────────────────────────── */}
      {showComponentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl my-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg" style={{ color: '#193A2A' }}>{editingComponent ? 'Editar Componente' : 'Novo Componente'}</h3>
              <button onClick={() => setShowComponentForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="text-xs text-gray-600 mb-1 block">Nome do componente *</label>
                  <Input value={componentForm.name} onChange={(e) => setComponentForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Fundação" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Ícone</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-lg text-center"
                    value={componentForm.icon}
                    onChange={(e) => setComponentForm((f) => ({ ...f, icon: e.target.value }))}
                  >
                    {COMPONENT_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Descrição</label>
                <Input value={componentForm.description} onChange={(e) => setComponentForm((f) => ({ ...f, description: e.target.value }))} placeholder="Breve descrição do que será inspecionado" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-2 block">Anomalias / Validações ({componentForm.anomalies.length})</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto mb-2">
                  {componentForm.anomalies.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1 text-sm bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">{a}</div>
                      <button onClick={() => removeAnomalyFromForm(idx)} className="text-red-400 hover:text-red-600 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newAnomalyText}
                    onChange={(e) => setNewAnomalyText(e.target.value)}
                    placeholder="Descrever nova anomalia/validação..."
                    className="flex-1 text-sm"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAnomalyToForm(); } }}
                  />
                  <Button
                    variant="outline"
                    onClick={addAnomalyToForm}
                    disabled={!newAnomalyText.trim()}
                    style={{ borderColor: '#AA8933', color: '#AA8933' }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowComponentForm(false)}>Cancelar</Button>
              <Button className="flex-1 text-white" style={{ backgroundColor: '#193A2A' }} onClick={handleSaveComponent}>
                {editingComponent ? 'Salvar Componente' : 'Criar Componente'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Severity Form Modal ────────────────────────────────────────────── */}
      {showSeverityForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg" style={{ color: '#193A2A' }}>{editingSeverity ? 'Editar Severidade' : 'Nova Severidade'}</h3>
              <button onClick={() => setShowSeverityForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Nome da Severidade *</label>
                <Input value={severityForm.label} onChange={(e) => setSeverityForm((f) => ({ ...f, label: e.target.value }))} placeholder="Ex: Crítico" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Cor</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={severityForm.color} onChange={(e) => setSeverityForm((f) => ({ ...f, color: e.target.value }))} className="w-12 h-9 rounded-lg border border-gray-200 cursor-pointer" />
                  <Input value={severityForm.color} onChange={(e) => setSeverityForm((f) => ({ ...f, color: e.target.value }))} placeholder="#dc2626" className="flex-1" />
                  <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: severityForm.color }} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Descrição</label>
                <Input value={severityForm.description} onChange={(e) => setSeverityForm((f) => ({ ...f, description: e.target.value }))} placeholder="Breve descrição..." />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowSeverityForm(false)}>Cancelar</Button>
              <Button className="flex-1 text-white" style={{ backgroundColor: '#193A2A' }} onClick={handleSaveSeverity}>
                {editingSeverity ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete User ────────────────────────────────────────────── */}
      {confirmDeleteUser && (
        <ConfirmDialog
          title="Excluir Usuário"
          message={`Tem certeza que deseja excluir o usuário "${confirmDeleteUser.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={() => handleDeleteUser(confirmDeleteUser)}
          onCancel={() => setConfirmDeleteUser(null)}
        />
      )}

      {/* ── Confirm Delete Structure ───────────────────────────────────────── */}
      {confirmDeleteStructure && (
        <ConfirmDialog
          title="Excluir Estrutura"
          message={`Tem certeza que deseja excluir a estrutura "${confirmDeleteStructure.name}"? As ordens de serviço vinculadas perderão a referência.`}
          onConfirm={() => handleDeleteStructure(confirmDeleteStructure)}
          onCancel={() => setConfirmDeleteStructure(null)}
        />
      )}

      {/* ── Confirm Delete Component ───────────────────────────────────────── */}
      {confirmDeleteComponent && (
        <ConfirmDialog
          title="Excluir Componente de Inspeção"
          message={`Tem certeza que deseja excluir o componente "${confirmDeleteComponent.name}" e todas as suas ${confirmDeleteComponent.anomalies.length} anomalia(s)?`}
          onConfirm={() => handleDeleteComponent(confirmDeleteComponent)}
          onCancel={() => setConfirmDeleteComponent(null)}
        />
      )}

      {/* ── Confirm Delete Severity ────────────────────────────────────────── */}
      {confirmDeleteSeverity && (
        <ConfirmDialog
          title="Excluir Severidade"
          message={`Tem certeza que deseja excluir a severidade "${confirmDeleteSeverity.label}"?`}
          onConfirm={() => handleDeleteSeverity(confirmDeleteSeverity)}
          onCancel={() => setConfirmDeleteSeverity(null)}
        />
      )}
    </div>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────

function InlineAnomalyAdder({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Adicionar nova anomalia..."
        className="flex-1 text-sm h-8"
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); if (text.trim()) { onAdd(text.trim()); setText(''); } }
        }}
      />
      <Button
        size="sm"
        className="h-8 px-3 text-white"
        style={{ backgroundColor: '#AA8933' }}
        disabled={!text.trim()}
        onClick={() => { if (text.trim()) { onAdd(text.trim()); setText(''); } }}
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium" style={{ color: '#193A2A' }}>{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancelar</Button>
          <Button className="flex-1 text-white bg-red-600 hover:bg-red-700" onClick={onConfirm}>Excluir</Button>
        </div>
      </div>
    </div>
  );
}

// ── System Status Panel ────────────────────────────────────────────────────────

function SystemStatusPanel({
  structures,
  users,
  orderCount,
  checklistComponents,
}: {
  structures: { id: string }[];
  users: { id: string; status: string }[];
  orderCount: number;
  checklistComponents: { id: string }[];
}) {
  const [refreshed, setRefreshed] = useState(new Date());

  function checkStorage() {
    try {
      localStorage.setItem('_ping', '1');
      localStorage.removeItem('_ping');
      return true;
    } catch { return false; }
  }

  const storageOk = checkStorage();
  const storageSize = (() => {
    try {
      const raw = localStorage.getItem('inspec360_v22_data');
      return raw ? (new Blob([raw]).size / 1024).toFixed(1) + ' KB' : '0 KB';
    } catch { return 'N/A'; }
  })();

  const modules = [
    { name: 'localStorage', status: storageOk ? 'ok' : 'error', detail: `Tamanho: ${storageSize}`, icon: <HardDrive className="w-5 h-5" /> },
    { name: 'Autenticação', status: users.length > 0 ? 'ok' : 'warning', detail: `${users.filter((u: {status:string}) => u.status==='active').length} usuários ativos`, icon: <Shield className="w-5 h-5" /> },
    { name: 'Motor de Inspeção', status: checklistComponents.length > 0 ? 'ok' : 'warning', detail: `${checklistComponents.length} componentes carregados`, icon: <ListChecks className="w-5 h-5" /> },
    { name: 'Gestão de Estruturas', status: structures.length > 0 ? 'ok' : 'warning', detail: `${structures.length} estruturas no banco`, icon: <Database className="w-5 h-5" /> },
    { name: 'Ordens de Serviço', status: 'ok', detail: `${orderCount} ordens no sistema`, icon: <ClipboardList className="w-5 h-5" /> },
    { name: 'Modo Offline', status: 'ok', detail: 'Todos os dados em localStorage', icon: <Cpu className="w-5 h-5" /> },
  ];

  const statusConfig: Record<string, { color: string; bg: string; label: string; dot: string }> = {
    ok: { color: '#16a34a', bg: '#f0fdf4', label: 'Operacional', dot: 'bg-green-500' },
    warning: { color: '#AA8933', bg: '#fff8e1', label: 'Atenção', dot: 'bg-amber-500' },
    error: { color: '#dc2626', bg: '#fef2f2', label: 'Falha', dot: 'bg-red-500' },
  };

  const allOk = modules.every(m => m.status === 'ok');
  const hasWarning = modules.some(m => m.status === 'warning');

  return (
    <div className="space-y-6">
      {/* Overall status */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${allOk ? 'bg-green-100' : hasWarning ? 'bg-amber-100' : 'bg-red-100'}`}>
            <div className={`w-8 h-8 rounded-full animate-pulse ${allOk ? 'bg-green-500' : hasWarning ? 'bg-amber-500' : 'bg-red-500'}`} />
          </div>
          <div>
            <h2 className="text-xl" style={{ color: '#193A2A' }}>
              {allOk ? '✅ Sistema Operacional' : hasWarning ? '⚠️ Sistema com Alertas' : '🔴 Sistema com Falhas'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Última verificação: {refreshed.toLocaleString('pt-BR')}
            </p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setRefreshed(new Date())}>
            <RefreshCw className="w-4 h-4 mr-2" />Verificar
          </Button>
        </div>
      </Card>

      {/* Module status grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const cfg = statusConfig[mod.status];
          return (
            <Card key={mod.name} className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: '#193A2A' }}>{mod.name}</span>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{mod.detail}</div>
                  <div className="text-xs mt-1 px-1.5 py-0.5 rounded inline-block" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Process flow */}
      <Card className="p-6">
        <h3 className="text-base mb-4" style={{ color: '#193A2A' }}>Fluxo do Sistema – Visão de Processos</h3>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { step: '1', label: 'Login/Auth', status: 'ok' },
            { step: '2', label: 'Supervisor cria Ordem', status: 'ok' },
            { step: '3', label: 'Técnico recebe Tarefa', status: 'ok' },
            { step: '4', label: 'Executa Inspeção', status: 'ok' },
            { step: '5', label: 'Registra Anomalias', status: 'ok' },
            { step: '6', label: 'Conclui e Salva', status: 'ok' },
            { step: '7', label: 'Supervisor Visualiza', status: 'ok' },
            { step: '8', label: 'Relatório/Export', status: 'ok' },
          ].map((step, i, arr) => (
            <div key={step.step} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: '#193A2A' }}>
                  {step.step}
                </div>
                <div className="text-[10px] text-gray-600 text-center mt-1 max-w-[60px] leading-tight">{step.label}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="w-6 h-0.5 mb-4" style={{ backgroundColor: '#AA8933' }} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Data integrity */}
      <Card className="p-6">
        <h3 className="text-base mb-4" style={{ color: '#193A2A' }}>Integridade dos Dados</h3>
        <div className="space-y-2">
          {[
            { label: 'Banco de Usuários', count: users.length, ok: users.length > 0 },
            { label: 'Banco de Estruturas', count: structures.length, ok: structures.length > 0 },
            { label: 'Ordens de Serviço', count: orderCount, ok: true },
            { label: 'Componentes de Inspeção', count: checklistComponents.length, ok: checklistComponents.length > 0 },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: item.ok ? '#f0fdf4' : '#fef2f2' }}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">{item.label}</span>
              </div>
              <span className="text-sm" style={{ color: item.ok ? '#16a34a' : '#dc2626' }}>
                {item.count} registro(s) {item.ok ? '✓' : '⚠'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}