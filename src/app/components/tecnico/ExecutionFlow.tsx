import { useState, useRef } from 'react';
import {
  ChevronLeft,
  Camera,
  CheckCircle2,
  MapPin,
  AlertTriangle,
  Info,
  Flag,
  Clock,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { PhotoManager } from '@/components/PhotoManager';
import type { ServiceOrder } from '../../data/types';
import {
  getStructureById,
  completeOrder,
  pauseOrder,
  addPhoto,
} from '../../data/store';
import type { User } from '../../App';

interface ExecutionFlowProps {
  order: ServiceOrder;
  user: User;
  onBack: () => void;
  onComplete: () => void;
  onPause: () => void;
}

export function ExecutionFlow({ order, user, onBack, onComplete, onPause }: ExecutionFlowProps) {
  const structure = getStructureById(order.structureId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<string[]>(order.photos || []);
  const [techniciansNotes, setTechniciansNotes] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseMotivo, setPauseMotivo] = useState('');
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const startedAt = order.startedAt
    ? new Date(order.startedAt).toLocaleString('pt-BR')
    : new Date().toLocaleString('pt-BR');

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPhotos((prev) => [...prev, base64]);
      addPhoto(order.id, base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  function handlePause() {
    pauseOrder(order.id, user.id, user.name, pauseMotivo || 'Pausa solicitada pelo técnico');
    onPause();
  }

  function handleComplete() {
    completeOrder(order.id, user.id, user.name);
    onComplete();
  }

  const priorityLabel: Record<string, string> = {
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
  };
  const priorityColor: Record<string, string> = {
    alta: '#dc2626',
    media: '#AA8933',
    baixa: '#193A2A',
  };

  // ── Pause modal ─────────────────────────────────────────────────────────────
  if (showPauseModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/50">
        <div className="w-full bg-white rounded-t-2xl p-6 space-y-4">
          <h3 className="text-base" style={{ color: '#193A2A' }}>Pausar Execução</h3>
          <p className="text-sm text-gray-600">O progresso será salvo. Você pode retomar de onde parou.</p>
          <Textarea
            placeholder="Motivo da pausa (opcional)"
            value={pauseMotivo}
            onChange={(e) => setPauseMotivo(e.target.value)}
            rows={3}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowPauseModal(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 text-white"
              style={{ backgroundColor: '#AA8933' }}
              onClick={handlePause}
            >
              Pausar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Complete confirm ─────────────────────────────────────────────────────────
  if (showCompleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/50">
        <div className="w-full bg-white rounded-t-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8" style={{ color: '#193A2A' }} />
            <div>
              <h3 className="text-base" style={{ color: '#193A2A' }}>Concluir Ordem de Serviço?</h3>
              <p className="text-sm text-gray-600">Esta ação não pode ser desfeita.</p>
            </div>
          </div>

          {photos.length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Nenhuma foto de evidência foi adicionada. Recomenda-se registrar ao menos uma foto do serviço concluído.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowCompleteConfirm(false)}>
              Voltar
            </Button>
            <Button
              className="flex-1 text-white"
              style={{ backgroundColor: '#193A2A' }}
              onClick={handleComplete}
            >
              Confirmar Conclusão
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main execution screen ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#193A2A' }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <div className="text-white text-xs opacity-75">Ordem de Execução</div>
            <div className="text-white text-sm">{order.id.toUpperCase()}</div>
          </div>
          <button
            onClick={() => setShowPauseModal(true)}
            className="text-white/80 hover:text-white"
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 pb-32 space-y-4">
        {/* Start info */}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
          <Clock className="w-4 h-4 text-green-600 shrink-0" />
          <span className="text-xs text-green-700">Iniciado em: {startedAt}</span>
        </div>

        {/* Structure info */}
        {structure && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#193A2A' }}>
              <h3 className="text-sm text-white">Estrutura</h3>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-base" style={{ color: '#193A2A' }}>{structure.name}</div>
                  <div className="text-xs text-gray-500">{structure.type} – {structure.lt}</div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: priorityColor[order.priority] }}
                >
                  Prioridade {priorityLabel[order.priority]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Tensão: {structure.voltage}</span>
                <span>Prog.: {structure.progressiva.toLocaleString('pt-BR')} m</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>
                  {structure.lat.toFixed(4)}°, {structure.lng.toFixed(4)}°
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: '#32473C' }}>
            <h3 className="text-sm text-white">Detalhes do Serviço</h3>
          </div>
          <div className="px-4 py-3 space-y-3">
            {order.component && (
              <div>
                <div className="text-xs text-gray-500">Componente</div>
                <div className="text-sm" style={{ color: '#193A2A' }}>{order.component}</div>
              </div>
            )}
            {order.anomaly && (
              <div>
                <div className="text-xs text-gray-500">Anomalia</div>
                <div className="text-sm" style={{ color: '#193A2A' }}>{order.anomaly}</div>
              </div>
            )}
            {order.description && (
              <div>
                <div className="text-xs text-gray-500">Descrição do Serviço</div>
                <div className="text-sm" style={{ color: '#193A2A' }}>{order.description}</div>
              </div>
            )}
            {order.details && (
              <div>
                <div className="text-xs text-gray-500">Detalhes Técnicos</div>
                <div className="text-sm text-gray-700 leading-relaxed">{order.details}</div>
              </div>
            )}
          </div>
        </div>

        {/* Deadline rules */}
        {order.deadlineRules && (
          <div className="flex items-start gap-3 p-4 rounded-xl border-l-4" style={{ backgroundColor: '#fff8e1', borderColor: '#AA8933' }}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#AA8933' }} />
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: '#AA8933' }}>Regras e Prazos</div>
              <div className="text-xs text-gray-700">{order.deadlineRules}</div>
            </div>
          </div>
        )}

        {/* Supervisor notes */}
        {order.supervisorNotes && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border-l-4 border-blue-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
            <div>
              <div className="text-xs font-medium mb-1 text-blue-600">Observações do Supervisor</div>
              <div className="text-xs text-gray-700">{order.supervisorNotes}</div>
            </div>
          </div>
        )}

        {/* Prazo */}
        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: '#AA8933' }} />
            <span className="text-sm" style={{ color: '#193A2A' }}>Prazo de execução</span>
          </div>
          <span className="text-sm font-medium" style={{ color: '#193A2A' }}>
            {new Date(order.deadline).toLocaleDateString('pt-BR')}
          </span>
        </div>

        {/* Technician notes */}
        <div className="bg-white rounded-xl shadow-sm px-4 py-3">
          <label className="text-xs text-gray-600 mb-1.5 block">Observações do Técnico</label>
          <Textarea
            placeholder="Registre aqui suas observações sobre a execução do serviço..."
            value={techniciansNotes}
            onChange={(e) => setTechniciansNotes(e.target.value)}
            rows={3}
            className="text-sm"
          />
        </div>

        {/* Evidence photos - Enhanced with Geolocation */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden px-4 py-3">
          <h3 className="text-sm font-medium mb-3" style={{ color: '#193A2A' }}>
            Fotos de Evidência (Antes e Depois)
          </h3>
          <PhotoManager
            photos={photos}
            onPhotosChange={setPhotos}
            inspectionId={order.id}
            technicianName={user.name}
          />
        </div>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg p-3 space-y-2">
        <Button
          className="w-full text-white"
          style={{ backgroundColor: '#193A2A' }}
          onClick={() => setShowCompleteConfirm(true)}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Concluir Ordem de Serviço
        </Button>
      </div>
    </div>
  );
}
