import { useState, useEffect, type FC } from 'react';
import {
  Users,
  Building2,
  ListChecks,
  ClipboardList,
  Wrench,
  ChevronRight,
  ChevronDown,
  Database,
  Link,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Pause,
  XCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  getStore,
  getInspectionRecords,
  getExecutionRecords,
} from '../../data/store';
import type {
  SystemUser,
  Structure,
  ComponentRule,
  InspectionRecord,
  ExecutionRecord,
  ServiceOrder,
} from '../../data/types';

interface DatabasesPanelProps {
  onRefresh?: () => void;
}

type ActiveBank = 'usuarios' | 'estruturas' | 'componentes' | 'inspecoes' | 'execucoes' | null;

const STATUS_INSP: Record<string, { label: string; color: string; Icon: FC<{ className?: string }> }> = {
  aberto: { label: 'Aberto', color: '#2563eb', Icon: Clock },
  'em-andamento': { label: 'Em Andamento', color: '#AA8933', Icon: Clock },
  pausado: { label: 'Pausado', color: '#BCA55C', Icon: Pause },
  concluido: { label: 'Concluído', color: '#16a34a', Icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: '#6b7280', Icon: XCircle },
};

export function DatabasesPanel({ onRefresh }: DatabasesPanelProps) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [components, setComponents] = useState<ComponentRule[]>([]);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [activeBank, setActiveBank] = useState<ActiveBank>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  function refresh() {
    const store = getStore();
    setUsers(store.users);
    setStructures(store.structures);
    setComponents(store.checklistComponents ?? []);
    setInspections(getInspectionRecords());
    setExecutions(getExecutionRecords());
    setOrders(store.serviceOrders);
    onRefresh?.();
  }

  useEffect(() => { refresh(); }, []);

  const banks = [
    {
      id: 'usuarios' as ActiveBank,
      icon: Users,
      color: '#193A2A',
      label: 'Banco de Usuários',
      description: 'Usuários, perfis e situação',
      count: users.length,
      fields: ['id', 'name', 'email', 'role', 'status', 'lastLogin'],
      links: [],
    },
    {
      id: 'estruturas' as ActiveBank,
      icon: Building2,
      color: '#32473C',
      label: 'Banco de Estruturas',
      description: 'Torres, coordenadas e metadados técnicos',
      count: structures.length,
      fields: ['id', 'name', 'type', 'classe', 'coordX', 'coordY', 'progressiva', 'deflexao', 'alturaUtil', 'vanFrente', 'cotaCentro', 'lt', 'voltage', 'cadeiaCondutor', 'qtdCadeias', 'cadeiaParaRaios', 'qtdCadeiasPR', 'estruturaCritica', 'observation'],
      links: ['createdBy → Usuários'],
    },
    {
      id: 'componentes' as ActiveBank,
      icon: ListChecks,
      color: '#AA8933',
      label: 'Banco de Componentes',
      description: 'Regras de validação e anomalias por componente',
      count: components.length,
      fields: ['id', 'name', 'icon', 'description', 'anomalies[]'],
      links: ['anomalies → Inspeções (validação)'],
    },
    {
      id: 'inspecoes' as ActiveBank,
      icon: ClipboardList,
      color: '#7c3aed',
      label: 'Banco de Inspeções',
      description: 'Registros completos de inspeção em campo',
      count: inspections.length,
      fields: ['id', 'orderId', 'estruturaId', 'estruturaNome', 'tecnicoId', 'tecnicoNome', 'supervisorId', 'dataHoraAbertura', 'dataHoraFim', 'status', 'components[]', 'historicoPausas[]', 'photos[]'],
      links: ['orderId → Ordens', 'estruturaId → Estruturas', 'tecnicoId → Usuários', 'supervisorId → Usuários', 'components[].componentId → Componentes'],
    },
    {
      id: 'execucoes' as ActiveBank,
      icon: Wrench,
      color: '#dc2626',
      label: 'Banco de Execuções',
      description: 'Registros de execução de serviço em campo',
      count: executions.length,
      fields: ['id', 'orderId', 'inspectionId?', 'estruturaId', 'estruturaNome', 'tecnicoId', 'tecnicoNome', 'supervisorId', 'componente', 'anomalia', 'descricao', 'dataHoraAbertura', 'dataHoraExecucaoInicio', 'dataHoraExecucaoFim', 'status', 'historicoPausas[]', 'photos[]'],
      links: ['orderId → Ordens', 'inspectionId → Inspeções', 'estruturaId → Estruturas', 'tecnicoId → Usuários', 'supervisorId → Usuários'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg" style={{ color: '#193A2A' }}>Bases de Dados do Sistema</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            5 bancos interligados · Dados reais sincronizados em tempo real
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />Atualizar
        </Button>
      </div>

      {/* Relationship Diagram */}
      <Card className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Link className="w-3.5 h-3.5" />Mapa de Relacionamentos
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#193A2A15', color: '#193A2A' }}>
            <Users className="w-3.5 h-3.5" />Usuários
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#32473C15', color: '#32473C' }}>
            <Building2 className="w-3.5 h-3.5" />Estruturas
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#7c3aed15', color: '#7c3aed' }}>
            <ClipboardList className="w-3.5 h-3.5" />Inspeções
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#dc262615', color: '#dc2626' }}>
            <Wrench className="w-3.5 h-3.5" />Execuções
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#AA893315', color: '#AA8933' }}>
            <ListChecks className="w-3.5 h-3.5" />Componentes
          </div>
          <span className="text-gray-400">→ validam anomalias nas</span>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#7c3aed15', color: '#7c3aed' }}>
            <ClipboardList className="w-3.5 h-3.5" />Inspeções
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-500">
          <span>📌 Inspeção → referencia Estrutura + Técnico + Supervisor</span>
          <span>📌 Execução → referencia Inspeção (quando aplicável)</span>
          <span>📌 Fotos organizadas por: inspeções/&#123;id&#125;/componentes/&#123;compId&#125;/</span>
        </div>
      </Card>

      {/* Banks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {banks.map((bank) => {
          const Icon = bank.icon;
          const isActive = activeBank === bank.id;
          return (
            <Card
              key={bank.id}
              className={`p-4 cursor-pointer transition-all border-2 ${isActive ? 'shadow-md' : 'hover:shadow-sm'}`}
              style={{ borderColor: isActive ? bank.color : 'transparent' }}
              onClick={() => setActiveBank(isActive ? null : bank.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: bank.color + '15' }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: bank.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#193A2A' }}>{bank.label}</div>
                    <div className="text-xs text-gray-500">{bank.description}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xl font-semibold" style={{ color: bank.color }}>{bank.count}</div>
                  <div className="text-xs text-gray-400">registros</div>
                </div>
              </div>
              {/* Fields preview */}
              <div className="flex flex-wrap gap-1 mb-2">
                {bank.fields.slice(0, 6).map((f) => (
                  <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">{f}</span>
                ))}
                {bank.fields.length > 6 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">+{bank.fields.length - 6}</span>
                )}
              </div>
              {/* Links */}
              {bank.links.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bank.links.map((l) => (
                    <span key={l} className="text-[10px] px-1.5 py-0.5 rounded border text-blue-600 border-blue-200 bg-blue-50 flex items-center gap-1">
                      <Link className="w-2.5 h-2.5" />{l}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-end mt-2">
                {isActive ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Expanded Bank Details */}
      {activeBank === 'usuarios' && (
        <UsersTable users={users} expandedRow={expandedRow} onExpand={setExpandedRow} />
      )}
      {activeBank === 'estruturas' && (
        <StructuresTable structures={structures} users={users} expandedRow={expandedRow} onExpand={setExpandedRow} />
      )}
      {activeBank === 'componentes' && (
        <ComponentsTable components={components} expandedRow={expandedRow} onExpand={setExpandedRow} />
      )}
      {activeBank === 'inspecoes' && (
        <InspecoesTable inspections={inspections} structures={structures} users={users} orders={orders} expandedRow={expandedRow} onExpand={setExpandedRow} />
      )}
      {activeBank === 'execucoes' && (
        <ExecucoesTable executions={executions} inspections={inspections} structures={structures} users={users} orders={orders} expandedRow={expandedRow} onExpand={setExpandedRow} />
      )}
    </div>
  );
}

// ─── Sub-tables ───────────────────────────────────────────────────────────────

function TableHeader({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base" style={{ color }}>{label}</h3>
      <span className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: color }}>{count} registros</span>
    </div>
  );
}

function FieldBadge({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-gray-400 font-mono uppercase">{label}</span>
      <span className="text-xs text-gray-700">{String(value ?? '—')}</span>
    </div>
  );
}

// Users Table
function UsersTable({ users, expandedRow, onExpand }: { users: SystemUser[]; expandedRow: string | null; onExpand: (id: string | null) => void }) {
  const roleColors: Record<string, string> = { tecnico: '#AA8933', supervisor: '#32473C', superadm: '#193A2A' };
  return (
    <Card className="p-6">
      <TableHeader label="Banco de Usuários" count={users.length} color="#193A2A" />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              {['ID', 'Nome', 'E-mail', 'Tipo de Acesso', 'Situação', 'Último Acesso', 'Criado em'].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <>
                <tr
                  key={u.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onExpand(expandedRow === u.id ? null : u.id)}
                >
                  <td className="py-2 px-3 font-mono text-gray-400">{u.id}</td>
                  <td className="py-2 px-3 font-medium text-gray-800">{u.name}</td>
                  <td className="py-2 px-3 text-gray-600">{u.email}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-full text-white text-[10px]" style={{ backgroundColor: roleColors[u.role] }}>
                      {u.role === 'tecnico' ? 'Técnico' : u.role === 'supervisor' ? 'Supervisor' : 'Super Admin'}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-500">{u.lastLogin}</td>
                  <td className="py-2 px-3 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                </tr>
                {expandedRow === u.id && (
                  <tr key={`${u.id}_exp`}>
                    <td colSpan={7} className="bg-gray-50 px-4 py-3">
                      <div className="grid grid-cols-3 gap-3">
                        <FieldBadge label="id" value={u.id} />
                        <FieldBadge label="name" value={u.name} />
                        <FieldBadge label="email" value={u.email} />
                        <FieldBadge label="role (tipo_acesso)" value={u.role} />
                        <FieldBadge label="status (situação)" value={u.status} />
                        <FieldBadge label="lastLogin" value={u.lastLogin} />
                        <FieldBadge label="password" value="••••••• (hash)" />
                        <FieldBadge label="phone" value={u.phone || '—'} />
                        <FieldBadge label="createdAt" value={u.createdAt || '—'} />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Structures Table
function StructuresTable({ structures, users, expandedRow, onExpand }: {
  structures: Structure[]; users: SystemUser[]; expandedRow: string | null; onExpand: (id: string | null) => void;
}) {
  return (
    <Card className="p-6">
      <TableHeader label="Banco de Estruturas" count={structures.length} color="#32473C" />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              {['ID', 'Nome', 'Tipo', 'Classe', 'Coord. X', 'Coord. Y', 'Progressiva', 'Deflexão', 'Alt. Útil', 'Vão Frente', 'Cota Centro', 'Crit.', 'Status', 'Criado por'].map((h) => (
                <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {structures.map((s) => {
              const creator = users.find((u) => u.id === s.createdBy);
              return (
                <>
                  <tr
                    key={s.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onExpand(expandedRow === s.id ? null : s.id)}
                  >
                    <td className="py-2 px-2 font-mono text-gray-400">{s.id}</td>
                    <td className="py-2 px-2 font-medium text-gray-800 whitespace-nowrap">{s.name}</td>
                    <td className="py-2 px-2 text-gray-600 whitespace-nowrap">{s.type}</td>
                    <td className="py-2 px-2 text-gray-600">{s.classe || '—'}</td>
                    <td className="py-2 px-2 font-mono text-gray-600">{s.coordX?.toFixed(5) ?? '—'}</td>
                    <td className="py-2 px-2 font-mono text-gray-600">{s.coordY?.toFixed(5) ?? '—'}</td>
                    <td className="py-2 px-2 text-gray-600">{s.progressiva.toLocaleString()}m</td>
                    <td className="py-2 px-2 text-gray-600">{s.deflexao != null ? `${s.deflexao}°` : '—'}</td>
                    <td className="py-2 px-2 text-gray-600">{s.alturaUtil != null ? `${s.alturaUtil}m` : '—'}</td>
                    <td className="py-2 px-2 text-gray-600">{s.vanFrente != null ? `${s.vanFrente}m` : '—'}</td>
                    <td className="py-2 px-2 text-gray-600">{s.cotaCentro != null ? `${s.cotaCentro}m` : '—'}</td>
                    <td className="py-2 px-2">
                      {s.estruturaCritica ? (
                        <span className="text-red-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${s.status === 'concluido' ? 'bg-green-100 text-green-700' : s.status === 'anomalia' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-500">{creator?.name || s.createdBy}</td>
                  </tr>
                  {expandedRow === s.id && (
                    <tr key={`${s.id}_exp`}>
                      <td colSpan={14} className="bg-gray-50 px-4 py-3">
                        <div className="grid grid-cols-4 gap-3">
                          <FieldBadge label="id" value={s.id} />
                          <FieldBadge label="name" value={s.name} />
                          <FieldBadge label="type" value={s.type} />
                          <FieldBadge label="classe" value={s.classe || '—'} />
                          <FieldBadge label="coordX (longitude)" value={s.coordX} />
                          <FieldBadge label="coordY (latitude)" value={s.coordY} />
                          <FieldBadge label="progressiva (m)" value={s.progressiva} />
                          <FieldBadge label="deflexao (°)" value={s.deflexao ?? '—'} />
                          <FieldBadge label="alturaUtil (m)" value={s.alturaUtil ?? '—'} />
                          <FieldBadge label="vanFrente (m)" value={s.vanFrente ?? '—'} />
                          <FieldBadge label="cotaCentro (m)" value={s.cotaCentro ?? '—'} />
                          <FieldBadge label="lt" value={s.lt} />
                          <FieldBadge label="voltage" value={s.voltage} />
                          <FieldBadge label="cadeiaCondutor" value={s.cadeiaCondutor || '—'} />
                          <FieldBadge label="qtdCadeias" value={s.qtdCadeias ?? '—'} />
                          <FieldBadge label="cadeiaParaRaios" value={s.cadeiaParaRaios || '—'} />
                          <FieldBadge label="qtdCadeiasPR" value={s.qtdCadeiasPR ?? '—'} />
                          <FieldBadge label="estruturaCritica" value={s.estruturaCritica ? 'Sim' : 'Não'} />
                          <FieldBadge label="observation" value={s.observation || '—'} />
                          <FieldBadge label="createdBy (FK→Usuários)" value={`${s.createdBy} (${creator?.name || ''})`} />
                          <FieldBadge label="createdAt" value={new Date(s.createdAt).toLocaleString('pt-BR')} />
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Components Table
function ComponentsTable({ components, expandedRow, onExpand }: {
  components: ComponentRule[]; expandedRow: string | null; onExpand: (id: string | null) => void;
}) {
  return (
    <Card className="p-6">
      <TableHeader label="Banco de Componentes (Regras de Validação)" count={components.length} color="#AA8933" />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              {['ID', 'Ícone', 'Nome do Componente', 'Descrição', 'Qtd. Anomalias Possíveis'].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <>
                <tr
                  key={c.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onExpand(expandedRow === c.id ? null : c.id)}
                >
                  <td className="py-2 px-3 font-mono text-gray-400 text-[10px]">{c.id}</td>
                  <td className="py-2 px-3 text-lg">{c.icon}</td>
                  <td className="py-2 px-3 font-medium text-gray-800">{c.name}</td>
                  <td className="py-2 px-3 text-gray-600 max-w-xs truncate">{c.description}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-full text-white text-[10px]" style={{ backgroundColor: '#AA8933' }}>
                      {c.anomalies.length} anomalias
                    </span>
                  </td>
                </tr>
                {expandedRow === c.id && (
                  <tr key={`${c.id}_exp`}>
                    <td colSpan={5} className="bg-amber-50 px-4 py-3">
                      <p className="text-xs font-medium text-amber-800 mb-2">
                        {`Anomalias possíveis para "${c.name}" (usadas como validação nas inspeções):`}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                        {c.anomalies.map((a, i) => (
                          <div key={i} className="text-xs bg-white border border-amber-200 rounded px-2 py-1 text-gray-700">
                            {i + 1}. {a}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Inspections Table
function InspecoesTable({ inspections, structures, users, orders, expandedRow, onExpand }: {
  inspections: InspectionRecord[]; structures: Structure[]; users: SystemUser[];
  orders: ServiceOrder[]; expandedRow: string | null; onExpand: (id: string | null) => void;
}) {
  return (
    <Card className="p-6">
      <TableHeader label="Banco de Inspeções" count={inspections.length} color="#7c3aed" />
      {inspections.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-200" />
          <p className="text-sm">Nenhuma inspeção registrada ainda.</p>
          <p className="text-xs mt-1">Registros serão criados quando um técnico iniciar uma OS de inspeção.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {['ID', 'OS Ref.', 'Estrutura', 'Técnico', 'Supervisor', 'Abertura', 'Fechamento', 'Status', 'Comps.', 'Pausas', 'Fotos'].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inspections.map((insp) => {
                const cfg = STATUS_INSP[insp.status] ?? STATUS_INSP.aberto;
                const StatusIcon = cfg.Icon;
                const okComps = insp.components.filter((c) => c.status === 'ok').length;
                const anomComps = insp.components.filter((c) => c.status === 'anomalia').length;
                const totalComps = insp.components.length;
                return (
                  <>
                    <tr
                      key={insp.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onExpand(expandedRow === insp.id ? null : insp.id)}
                    >
                      <td className="py-2 px-2 font-mono text-[10px] text-gray-400">{insp.id}</td>
                      <td className="py-2 px-2 font-mono text-purple-600">{insp.orderId}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{insp.estruturaNome}</div>
                        <div className="text-gray-400 font-mono text-[10px]">{insp.estruturaId}</div>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <div className="text-gray-700">{insp.tecnicoNome}</div>
                        <div className="text-gray-400 font-mono text-[10px]">FK:{insp.tecnicoId}</div>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-gray-600">{insp.supervisorNome}</td>
                      <td className="py-2 px-2 whitespace-nowrap text-gray-500">
                        {new Date(insp.dataHoraAbertura).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-gray-500">
                        {insp.dataHoraFim ? new Date(insp.dataHoraFim).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td className="py-2 px-2">
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.color + '15', color: cfg.color }}>
                          <StatusIcon className="w-3 h-3" />{cfg.label}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-green-600">{okComps}✓</span>
                        {anomComps > 0 && <span className="text-red-600 ml-1">{anomComps}⚠</span>}
                        <span className="text-gray-400">/{totalComps}</span>
                      </td>
                      <td className="py-2 px-2 text-gray-500">{insp.historicoPausas.length}</td>
                      <td className="py-2 px-2 text-gray-500">{insp.photos.length}</td>
                    </tr>
                    {expandedRow === insp.id && (
                      <tr key={`${insp.id}_exp`}>
                        <td colSpan={11} className="bg-purple-50 px-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Left: Field breakdown */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-purple-800 mb-2">📋 Campos do Registro</p>
                              <div className="grid grid-cols-2 gap-2">
                                <FieldBadge label="id" value={insp.id} />
                                <FieldBadge label="orderId (FK→Ordens)" value={insp.orderId} />
                                <FieldBadge label="estruturaId (FK→Estruturas)" value={insp.estruturaId} />
                                <FieldBadge label="estruturaNome" value={insp.estruturaNome} />
                                <FieldBadge label="tecnicoId (FK→Usuários)" value={insp.tecnicoId} />
                                <FieldBadge label="tecnicoNome" value={insp.tecnicoNome} />
                                <FieldBadge label="supervisorId (FK→Usuários)" value={insp.supervisorId} />
                                <FieldBadge label="supervisorNome" value={insp.supervisorNome} />
                                <FieldBadge label="dataHoraAbertura" value={new Date(insp.dataHoraAbertura).toLocaleString('pt-BR')} />
                                <FieldBadge label="dataHoraFim" value={insp.dataHoraFim ? new Date(insp.dataHoraFim).toLocaleString('pt-BR') : '—'} />
                                <FieldBadge label="status" value={insp.status} />
                                <FieldBadge label="observacoesGerais" value={insp.observacoesGerais || '—'} />
                              </div>
                            </div>
                            {/* Right: Components + Pauses */}
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-semibold text-purple-800 mb-1">🔧 Componentes ({insp.components.length})</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {insp.components.map((comp) => (
                                    <div key={comp.componentId} className={`flex items-center justify-between text-xs px-2 py-1 rounded ${comp.status === 'ok' ? 'bg-green-50' : comp.status === 'anomalia' ? 'bg-red-50' : 'bg-white'}`}>
                                      <span className="text-gray-700">{comp.componentName}</span>
                                      <span className={`font-medium ${comp.status === 'ok' ? 'text-green-600' : comp.status === 'anomalia' ? 'text-red-600' : 'text-gray-400'}`}>{comp.status}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-purple-800 mb-1">⏸ Histórico de Pausas ({insp.historicoPausas.length})</p>
                                {insp.historicoPausas.length === 0 ? (
                                  <p className="text-xs text-gray-400">Sem pausas registradas</p>
                                ) : (
                                  <div className="space-y-1">
                                    {insp.historicoPausas.map((p, i) => (
                                      <div key={i} className="text-xs bg-white rounded px-2 py-1 border border-purple-100">
                                        <span className="text-gray-600">Pausou: {new Date(p.pausedAt).toLocaleString('pt-BR')}</span>
                                        {p.resumedAt && <span className="text-green-600 ml-2">→ Retomou: {new Date(p.resumedAt).toLocaleString('pt-BR')}</span>}
                                        {p.motivo && <span className="text-gray-400 ml-2">({p.motivo})</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-purple-800 mb-1">📷 Fotos ({insp.photos.length})</p>
                                {insp.photos.length === 0 ? (
                                  <p className="text-xs text-gray-400">Nenhuma foto anexada</p>
                                ) : (
                                  <div className="text-xs text-gray-500">
                                    {insp.photos.slice(0, 3).map((ph) => (
                                      <div key={ph.id} className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-purple-100 mb-0.5 truncate">
                                        📁 {ph.storagePath || ph.id}
                                      </div>
                                    ))}
                                    {insp.photos.length > 3 && <span className="text-gray-400">+{insp.photos.length - 3} mais</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// Executions Table
function ExecucoesTable({ executions, inspections, structures, users, orders, expandedRow, onExpand }: {
  executions: ExecutionRecord[]; inspections: InspectionRecord[]; structures: Structure[];
  users: SystemUser[]; orders: ServiceOrder[]; expandedRow: string | null; onExpand: (id: string | null) => void;
}) {
  return (
    <Card className="p-6">
      <TableHeader label="Banco de Execuções" count={executions.length} color="#dc2626" />
      {executions.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Wrench className="w-10 h-10 mx-auto mb-2 text-gray-200" />
          <p className="text-sm">Nenhuma execução registrada ainda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {['ID', 'OS Ref.', 'Inspeção Ref.', 'Estrutura', 'Técnico', 'Componente / Anomalia', 'Abertura OS', 'Início Exec.', 'Fim Exec.', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {executions.map((exec) => {
                const cfg = STATUS_INSP[exec.status] ?? STATUS_INSP.aberto;
                const StatusIcon = cfg.Icon;
                return (
                  <>
                    <tr
                      key={exec.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onExpand(expandedRow === exec.id ? null : exec.id)}
                    >
                      <td className="py-2 px-2 font-mono text-[10px] text-gray-400">{exec.id}</td>
                      <td className="py-2 px-2 font-mono text-red-600">{exec.orderId}</td>
                      <td className="py-2 px-2 font-mono text-purple-500">{exec.inspectionId || '—'}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{exec.estruturaNome}</div>
                        <div className="text-gray-400 font-mono text-[10px]">{exec.estruturaId}</div>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-gray-700">{exec.tecnicoNome}</td>
                      <td className="py-2 px-2 max-w-xs">
                        <div className="font-medium text-gray-800 truncate">{exec.componente}</div>
                        <div className="text-gray-500 truncate">{exec.anomalia}</div>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-gray-500">
                        {new Date(exec.dataHoraAbertura).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-gray-500">
                        {exec.dataHoraExecucaoInicio ? new Date(exec.dataHoraExecucaoInicio).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-gray-500">
                        {exec.dataHoraExecucaoFim ? new Date(exec.dataHoraExecucaoFim).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td className="py-2 px-2">
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.color + '15', color: cfg.color }}>
                          <StatusIcon className="w-3 h-3" />{cfg.label}
                        </span>
                      </td>
                    </tr>
                    {expandedRow === exec.id && (
                      <tr key={`${exec.id}_exp`}>
                        <td colSpan={10} className="bg-red-50 px-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-red-800 mb-2">📋 Campos do Registro de Execução</p>
                              <div className="grid grid-cols-2 gap-2">
                                <FieldBadge label="id" value={exec.id} />
                                <FieldBadge label="orderId (FK→Ordens)" value={exec.orderId} />
                                <FieldBadge label="inspectionId (FK→Inspeções)" value={exec.inspectionId || '—'} />
                                <FieldBadge label="estruturaId (FK→Estruturas)" value={exec.estruturaId} />
                                <FieldBadge label="estruturaNome" value={exec.estruturaNome} />
                                <FieldBadge label="tecnicoId (FK→Usuários)" value={exec.tecnicoId} />
                                <FieldBadge label="tecnicoNome" value={exec.tecnicoNome} />
                                <FieldBadge label="supervisorId (FK→Usuários)" value={exec.supervisorId} />
                                <FieldBadge label="componente" value={exec.componente} />
                                <FieldBadge label="anomalia" value={exec.anomalia} />
                                <FieldBadge label="descricao" value={exec.descricao || '—'} />
                                <FieldBadge label="dataHoraAbertura" value={new Date(exec.dataHoraAbertura).toLocaleString('pt-BR')} />
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-red-800 mb-2">⏱ Timing da Execução</p>
                              <div className="grid grid-cols-1 gap-2 mb-3">
                                <FieldBadge label="dataHoraExecucaoInicio" value={exec.dataHoraExecucaoInicio ? new Date(exec.dataHoraExecucaoInicio).toLocaleString('pt-BR') : 'Não iniciado'} />
                                <FieldBadge label="dataHoraExecucaoFim" value={exec.dataHoraExecucaoFim ? new Date(exec.dataHoraExecucaoFim).toLocaleString('pt-BR') : 'Não finalizado'} />
                                <FieldBadge label="dataHoraFim (conclusão)" value={exec.dataHoraFim ? new Date(exec.dataHoraFim).toLocaleString('pt-BR') : '—'} />
                                <FieldBadge label="status" value={exec.status} />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-red-800 mb-1">⏸ Histórico de Pausas ({exec.historicoPausas.length})</p>
                                {exec.historicoPausas.length === 0 ? (
                                  <p className="text-xs text-gray-400">Sem pausas</p>
                                ) : (
                                  <div className="space-y-1">
                                    {exec.historicoPausas.map((p, i) => (
                                      <div key={i} className="text-xs bg-white rounded px-2 py-1 border border-red-100">
                                        <span className="text-gray-600">Pausou: {new Date(p.pausedAt).toLocaleString('pt-BR')}</span>
                                        {p.resumedAt && <span className="text-green-600 ml-2">→ {new Date(p.resumedAt).toLocaleString('pt-BR')}</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
