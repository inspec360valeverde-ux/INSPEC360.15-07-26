import type { ServiceOrder, ComponentInspection, AnomalyEntry, InspectionData, AnomalyPhase } from '../../data/types';
import { PHASE_OPTIONS } from '../../data/checklistRules';
import {
  saveInspectionProgress,
  completeOrder,
  pauseOrder,
  generateId,
  getChecklistComponents,
  getSeverities,
} from '../../data/store';
import { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  Plus,
  Trash2,
  Flag,
  Zap,
  ShieldAlert,
  RotateCcw,
  PowerOff,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { PhotoManager } from '@/components/PhotoManager';
import type { User } from '../../App';

interface InspectionFlowProps {
  order: ServiceOrder;
  user: User;
  onBack: () => void;
  onComplete: () => void;
  onPause: () => void;
}

const PHASE_COLORS: Record<string, string> = {
  A: '#dc2626',
  B: '#2563eb',
  C: '#16a34a',
  N: '#6b7280',
  Geral: '#7c3aed',
};

export function InspectionFlow({ order, user, onBack, onComplete, onPause }: InspectionFlowProps) {
  const INSPECTION_COMPONENTS = getChecklistComponents();
  const SEVERITIES = getSeverities();

  const [inspData, setInspData] = useState<InspectionData>(() => {
    if (order.inspectionData) return order.inspectionData;
    return {
      currentComponentIndex: 0,
      components: INSPECTION_COMPONENTS.map((c) => ({
        componentId: c.id,
        componentName: c.name,
        status: 'pendente' as const,
        anomalies: [],
      })),
    };
  });

  const defaultAnomaly = {
    name: '',
    severity: SEVERITIES[0]?.id ?? 'leve',
    phase: 'Geral' as AnomalyPhase,
    isEmenda: false,
    safetyRisk: SEVERITIES[0]?.id ?? 'leve',
    operationalRisk: SEVERITIES[0]?.id ?? 'leve',
    requiresShutdown: false,
    isRecurrent: false,
    observation: '',
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAnomalyForm, setShowAnomalyForm] = useState(false);
  const [addingAnomaly, setAddingAnomaly] = useState(defaultAnomaly);

  const [showSummary, setShowSummary] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseMotivo, setPauseMotivo] = useState('');

  const currentIdx = inspData.currentComponentIndex;
  const currentRule = INSPECTION_COMPONENTS[currentIdx];
  const currentComp = inspData.components[currentIdx];
  const totalComponents = INSPECTION_COMPONENTS.length;
  const progress = Math.round(
    (inspData.components.filter((c) => c.status !== 'pendente').length / totalComponents) * 100
  );

  function save(data: InspectionData) {
    setInspData(data);
    saveInspectionProgress(order.id, data);
  }

  function setCompStatus(status: ComponentInspection['status']) {
    const updated = { ...inspData };
    updated.components[currentIdx] = {
      ...currentComp,
      status,
      anomalies: status === 'ok' || status === 'nao-aplicavel' ? [] : currentComp.anomalies,
    };
    save(updated);
  }

  function addAnomaly() {
    if (!addingAnomaly.name) return;
    const entry: AnomalyEntry = {
      id: generateId(),
      anomalyName: addingAnomaly.name,
      severity: addingAnomaly.severity,
      phase: addingAnomaly.phase,
      isEmenda: addingAnomaly.isEmenda,
      safetyRisk: addingAnomaly.safetyRisk,
      operationalRisk: addingAnomaly.operationalRisk,
      requiresShutdown: addingAnomaly.requiresShutdown,
      isRecurrent: addingAnomaly.isRecurrent,
      observation: addingAnomaly.observation,
    };
    const updated = { ...inspData };
    updated.components[currentIdx] = {
      ...currentComp,
      status: 'anomalia',
      anomalies: [...(currentComp.anomalies || []), entry],
    };
    save(updated);
    setAddingAnomaly(defaultAnomaly);
    setShowAnomalyForm(false);
  }

  function removeAnomaly(anomalyId: string) {
    const updated = { ...inspData };
    const comp = { ...currentComp };
    comp.anomalies = comp.anomalies.filter((a) => a.id !== anomalyId);
    if (comp.anomalies.length === 0 && comp.status === 'anomalia') comp.status = 'pendente';
    updated.components[currentIdx] = comp;
    save(updated);
  }

  function goNext() {
    if (currentComp.status === 'pendente') {
      alert('Por favor, registre o status deste componente antes de avançar.');
      return;
    }
    if (currentIdx < totalComponents - 1) {
      save({ ...inspData, currentComponentIndex: currentIdx + 1 });
    } else {
      setShowSummary(true);
    }
  }

  function goPrev() {
    if (currentIdx > 0) save({ ...inspData, currentComponentIndex: currentIdx - 1 });
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      const updated = { ...inspData };
      const comp = { ...currentComp };
      comp.photos = [...(comp.photos || []), base64];
      updated.components[currentIdx] = comp;
      save(updated);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handlePause() {
    pauseOrder(order.id, user.id, user.name, pauseMotivo || 'Pausa solicitada pelo técnico');
    onPause();
  }

  function handleComplete() {
    completeOrder(order.id, user.id, user.name);
    onComplete();
  }

  const statusConfig = {
    ok: { label: 'Sem anomalia', icon: <CheckCircle2 className="w-5 h-5" />, color: '#193A2A', bg: '#e8f5e9' },
    anomalia: { label: 'Com anomalia', icon: <AlertTriangle className="w-5 h-5" />, color: '#AA8933', bg: '#fff8e1' },
    'nao-aplicavel': { label: 'Não se aplica', icon: <XCircle className="w-5 h-5" />, color: '#6b7280', bg: '#f3f4f6' },
    pendente: { label: 'Pendente', icon: null, color: '#9ca3af', bg: '#f9fafb' },
  };

  function getSeverityById(id: string) {
    return SEVERITIES.find((s) => s.id === id) ?? { label: id, color: '#6b7280' };
  }

  // ── Summary screen ──────────────────────────────────────────────────────────
  if (showSummary) {
    const anomalyComponents = inspData.components.filter((c) => c.status === 'anomalia');
    const okComponents = inspData.components.filter((c) => c.status === 'ok');
    const naComponents = inspData.components.filter((c) => c.status === 'nao-aplicavel');

    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="sticky top-0 z-10 px-4 py-3 shadow-sm flex items-center gap-3" style={{ backgroundColor: '#193A2A' }}>
          <button onClick={() => setShowSummary(false)} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-white text-sm">Resumo da Inspeção</div>
        </div>

        <div className="flex-1 p-4 space-y-4 pb-32">
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: okComponents.length, label: 'Sem anomalia', color: '#193A2A' },
              { val: anomalyComponents.length, label: 'Com anomalia', color: '#AA8933' },
              { val: naComponents.length, label: 'N/A', color: '#6b7280' },
            ].map(({ val, label, color }) => (
              <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                <div className="text-2xl" style={{ color }}>{val}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {anomalyComponents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm" style={{ color: '#193A2A' }}>
                  Anomalias Identificadas ({anomalyComponents.reduce((s, c) => s + c.anomalies.length, 0)})
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {anomalyComponents.map((comp) =>
                  comp.anomalies.map((a) => {
                    const sev = getSeverityById(a.severity);
                    return (
                      <div key={a.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">{comp.componentName}</div>
                            <div className="text-sm" style={{ color: '#193A2A' }}>{a.anomalyName}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: PHASE_COLORS[a.phase] + '20', color: PHASE_COLORS[a.phase] }}>Fase {a.phase}</span>
                              {a.requiresShutdown && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600">Desligamento</span>}
                              {a.isRecurrent && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">Reincidente</span>}
                              {a.isEmenda && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">Emenda</span>}
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: sev.color }}>
                            {sev.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm" style={{ color: '#193A2A' }}>Todos os Componentes</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {inspData.components.map((comp) => {
                const cfg = statusConfig[comp.status];
                return (
                  <div key={comp.componentId} className="flex items-center px-4 py-2.5 gap-3">
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                    <span className="flex-1 text-sm">{comp.componentName}</span>
                    {comp.anomalies.length > 0 && (
                      <span className="text-xs text-gray-400">{comp.anomalies.length} anomalia(s)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg">
          <Button className="w-full text-white" style={{ backgroundColor: '#193A2A' }} onClick={handleComplete}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Concluir Inspeção
          </Button>
        </div>
      </div>
    );
  }

  // ── Pause modal ─────────────────────────────────────────────────────────────
  if (showPauseModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/50">
        <div className="w-full bg-white rounded-t-2xl p-6 space-y-4">
          <h3 className="text-base" style={{ color: '#193A2A' }}>Pausar Inspeção</h3>
          <p className="text-sm text-gray-600">O progresso será salvo. Você pode retomar de onde parou.</p>
          <Textarea
            placeholder="Motivo da pausa (opcional)"
            value={pauseMotivo}
            onChange={(e) => setPauseMotivo(e.target.value)}
            rows={3}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowPauseModal(false)}>Cancelar</Button>
            <Button className="flex-1 text-white" style={{ backgroundColor: '#AA8933' }} onClick={handlePause}>Pausar</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checklist step ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />

      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#193A2A' }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="text-white"><ChevronLeft className="w-6 h-6" /></button>
          <div className="flex-1">
            <div className="text-white text-xs opacity-75">Inspeção em andamento</div>
            <div className="text-white text-sm">{currentRule?.name}</div>
          </div>
          <button onClick={() => setShowPauseModal(true)} className="text-white/80 hover:text-white">
            <Flag className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-xs text-white/70 mb-1">
            <span>Componente {currentIdx + 1} de {totalComponents}</span>
            <span>{progress}% concluído</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/20">
            <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: '#AA8933' }} />
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto">
        {inspData.components.map((comp, i) => {
          const cfg = statusConfig[comp.status];
          return (
            <div
              key={comp.componentId}
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs transition-all"
              style={{
                backgroundColor: i === currentIdx ? '#AA8933' : comp.status !== 'pendente' ? cfg.color : '#d1d5db',
                border: i === currentIdx ? '2px solid #AA8933' : 'none',
              }}
            >
              {comp.status !== 'pendente' && i !== currentIdx
                ? comp.status === 'ok' ? '✓' : comp.status === 'anomalia' ? '!' : '–'
                : i + 1}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-32 space-y-3">
        {/* Component card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{currentRule?.icon}</span>
              <div>
                <h2 className="text-base" style={{ color: '#193A2A' }}>{currentRule?.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{currentRule?.description}</p>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4 grid grid-cols-3 gap-2">
            {(['ok', 'anomalia', 'nao-aplicavel'] as const).map((s) => {
              const cfg = statusConfig[s];
              const active = currentComp?.status === s;
              return (
                <button
                  key={s}
                  onClick={() => { setCompStatus(s); if (s !== 'anomalia') setShowAnomalyForm(false); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: active ? cfg.color : '#e5e7eb',
                    backgroundColor: active ? cfg.bg : '#f9fafb',
                    color: active ? cfg.color : '#9ca3af',
                  }}
                >
                  <span style={{ color: active ? cfg.color : '#9ca3af' }}>{cfg.icon}</span>
                  <span className="text-xs text-center leading-tight">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Anomaly section */}
        {currentComp?.status === 'anomalia' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm" style={{ color: '#193A2A' }}>Anomalias Registradas</h3>
              <button
                onClick={() => setShowAnomalyForm(!showAnomalyForm)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white"
                style={{ backgroundColor: '#AA8933' }}
              >
                <Plus className="w-3 h-3" />
                Adicionar
              </button>
            </div>

            {/* ── Enhanced anomaly form ── */}
            {showAnomalyForm && (
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 space-y-3">
                {/* 1. Anomaly type */}
                <div>
                  <label className="text-xs text-gray-600 mb-1 block flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Tipo de anomalia *
                  </label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {currentRule?.anomalies.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAddingAnomaly((prev) => ({ ...prev, name: a }))}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg border transition-all"
                        style={{
                          borderColor: addingAnomaly.name === a ? '#AA8933' : '#e5e7eb',
                          backgroundColor: addingAnomaly.name === a ? '#fff8e1' : '#fff',
                          color: addingAnomaly.name === a ? '#AA8933' : '#374151',
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Severity */}
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Severidade *</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SEVERITIES.map((sev) => (
                      <button
                        key={sev.id}
                        onClick={() => setAddingAnomaly((prev) => ({ ...prev, severity: sev.id }))}
                        className="text-xs py-2 px-2 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: addingAnomaly.severity === sev.id ? sev.color : '#e5e7eb',
                          backgroundColor: addingAnomaly.severity === sev.id ? sev.color + '20' : '#fff',
                          color: addingAnomaly.severity === sev.id ? sev.color : '#9ca3af',
                        }}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Phase */}
                <div>
                  <label className="text-xs text-gray-600 mb-1 block flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Fase
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {PHASE_OPTIONS.map((ph) => (
                      <button
                        key={ph.value}
                        onClick={() => setAddingAnomaly((prev) => ({ ...prev, phase: ph.value as AnomalyPhase }))}
                        className="text-xs px-3 py-1.5 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: addingAnomaly.phase === ph.value ? PHASE_COLORS[ph.value] : '#e5e7eb',
                          backgroundColor: addingAnomaly.phase === ph.value ? PHASE_COLORS[ph.value] + '20' : '#fff',
                          color: addingAnomaly.phase === ph.value ? PHASE_COLORS[ph.value] : '#6b7280',
                        }}
                      >
                        {ph.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Safety Risk */}
                <div>
                  <label className="text-xs text-gray-600 mb-1 block flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Risco de Segurança
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SEVERITIES.map((sev) => (
                      <button
                        key={sev.id}
                        onClick={() => setAddingAnomaly((prev) => ({ ...prev, safetyRisk: sev.id }))}
                        className="text-xs py-1.5 px-2 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: addingAnomaly.safetyRisk === sev.id ? sev.color : '#e5e7eb',
                          backgroundColor: addingAnomaly.safetyRisk === sev.id ? sev.color + '20' : '#fff',
                          color: addingAnomaly.safetyRisk === sev.id ? sev.color : '#9ca3af',
                        }}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Operational Risk */}
                <div>
                  <label className="text-xs text-gray-600 mb-1 block flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-orange-500" /> Risco Operacional
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SEVERITIES.map((sev) => (
                      <button
                        key={sev.id}
                        onClick={() => setAddingAnomaly((prev) => ({ ...prev, operationalRisk: sev.id }))}
                        className="text-xs py-1.5 px-2 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: addingAnomaly.operationalRisk === sev.id ? sev.color : '#e5e7eb',
                          backgroundColor: addingAnomaly.operationalRisk === sev.id ? sev.color + '20' : '#fff',
                          color: addingAnomaly.operationalRisk === sev.id ? sev.color : '#9ca3af',
                        }}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Toggles row */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Emenda */}
                  <button
                    onClick={() => setAddingAnomaly((prev) => ({ ...prev, isEmenda: !prev.isEmenda }))}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: addingAnomaly.isEmenda ? '#2563eb' : '#e5e7eb',
                      backgroundColor: addingAnomaly.isEmenda ? '#eff6ff' : '#fff',
                      color: addingAnomaly.isEmenda ? '#2563eb' : '#9ca3af',
                    }}
                  >
                    <span className="text-base">🔗</span>
                    <span className="text-[10px] text-center leading-tight">Emenda</span>
                    {addingAnomaly.isEmenda && <span className="text-[9px] text-blue-600">✓ Sim</span>}
                  </button>

                  {/* Requires Shutdown */}
                  <button
                    onClick={() => setAddingAnomaly((prev) => ({ ...prev, requiresShutdown: !prev.requiresShutdown }))}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: addingAnomaly.requiresShutdown ? '#dc2626' : '#e5e7eb',
                      backgroundColor: addingAnomaly.requiresShutdown ? '#fef2f2' : '#fff',
                      color: addingAnomaly.requiresShutdown ? '#dc2626' : '#9ca3af',
                    }}
                  >
                    <PowerOff className="w-4 h-4" />
                    <span className="text-[10px] text-center leading-tight">Desligamento</span>
                    {addingAnomaly.requiresShutdown && <span className="text-[9px] text-red-600">✓ Sim</span>}
                  </button>

                  {/* Recurrent */}
                  <button
                    onClick={() => setAddingAnomaly((prev) => ({ ...prev, isRecurrent: !prev.isRecurrent }))}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: addingAnomaly.isRecurrent ? '#ea580c' : '#e5e7eb',
                      backgroundColor: addingAnomaly.isRecurrent ? '#fff7ed' : '#fff',
                      color: addingAnomaly.isRecurrent ? '#ea580c' : '#9ca3af',
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-[10px] text-center leading-tight">Reincidente</span>
                    {addingAnomaly.isRecurrent && <span className="text-[9px] text-orange-600">✓ Sim</span>}
                  </button>
                </div>

                {/* Observation */}
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Observação</label>
                  <Textarea
                    placeholder="Descreva em detalhes..."
                    value={addingAnomaly.observation}
                    onChange={(e) => setAddingAnomaly((prev) => ({ ...prev, observation: e.target.value }))}
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1"
                    onClick={() => { setShowAnomalyForm(false); setAddingAnomaly(defaultAnomaly); }}>
                    Cancelar
                  </Button>
                  <Button size="sm" className="flex-1 text-white" style={{ backgroundColor: '#AA8933' }}
                    onClick={addAnomaly} disabled={!addingAnomaly.name}>
                    Confirmar
                  </Button>
                </div>
              </div>
            )}

            {/* Anomaly list */}
            {currentComp?.anomalies.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Clique em "Adicionar" para registrar anomalias
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {currentComp?.anomalies.map((a) => {
                  const sev = getSeverityById(a.severity);
                  return (
                    <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm" style={{ color: '#193A2A' }}>{a.anomalyName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: sev.color }}>{sev.label}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: PHASE_COLORS[a.phase] + '20', color: PHASE_COLORS[a.phase] }}>F{a.phase}</span>
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {a.isEmenda && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">Emenda</span>}
                          {a.requiresShutdown && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">Desligamento</span>}
                          {a.isRecurrent && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">Reincidente</span>}
                        </div>
                        {a.observation && <p className="text-xs text-gray-500 mt-0.5">{a.observation}</p>}
                      </div>
                      <button onClick={() => removeAnomaly(a.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Photo section - Enhanced with Geolocation */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden px-4 py-3">
          <h3 className="text-sm font-medium mb-3" style={{ color: '#193A2A' }}>
            Registrar Evidências Fotográficas
          </h3>
          <PhotoManager
            componentId={currentComp?.componentId}
            componentName={currentComp?.componentName}
            anomalyId={currentComp?.anomalies?.[0]?.id}
            anomalyName={currentComp?.anomalies?.[0]?.anomalyName}
            photos={currentComp?.photos || []}
            onPhotosChange={(newPhotos) => {
              const updated = { ...inspData };
              updated.components[currentIdx] = { ...currentComp, photos: newPhotos };
              save(updated);
            }}
            inspectionId={order.id}
          />
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm px-4 py-3">
          <label className="text-xs text-gray-600 mb-1.5 block">Observações do componente</label>
          <Textarea
            placeholder="Anotações adicionais..."
            value={currentComp?.notes || ''}
            onChange={(e) => {
              const updated = { ...inspData };
              updated.components[currentIdx] = { ...currentComp, notes: e.target.value };
              save(updated);
            }}
            rows={2}
            className="text-sm"
          />
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg p-3">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-none px-4" onClick={goPrev} disabled={currentIdx === 0}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            className="flex-1 text-white"
            style={{ backgroundColor: currentIdx === totalComponents - 1 ? '#193A2A' : '#AA8933' }}
            onClick={goNext}
          >
            {currentIdx === totalComponents - 1 ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" />Revisar e Concluir</>
            ) : (
              <>Próximo<ChevronRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
