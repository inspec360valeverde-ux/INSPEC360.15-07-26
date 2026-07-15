import { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { getStore, saveStore } from '@/app/data/store';
import type { AppData } from '@/app/data/types';
import {
  exportDataAsJSON,
  exportStructuresAsCSV,
  exportServiceOrdersAsCSV,
  exportServiceOrdersAsExcel,
  createBackupInStorage,
  getBackupsList,
  restoreBackup,
  deleteBackup,
  downloadFile,
  downloadBlobFile,
  importDataFromFile,
  formatFileSize,
  formatDate,
} from '@/utils/backupManager';

interface BackupPanelProps {
  onClose: () => void;
}

type BackupTab = 'export' | 'backups' | 'restore' | 'settings';

export function BackupPanel({ onClose }: BackupPanelProps) {
  const [activeTab, setActiveTab] = useState<BackupTab>('export');
  const [backupsList, setBackupsList] = useState(getBackupsList());
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshBackupsList = () => {
    setBackupsList(getBackupsList());
  };

  // ── EXPORT FUNCTIONS ──────────────────────────────────────────────────────────

  const handleExportJSON = () => {
    try {
      setIsProcessing(true);
      const store = getStore();
      const json = exportDataAsJSON(store);
      const filename = `inspec360_backup_${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(json, filename, 'json');
      showToast('✅ Dados exportados com sucesso!', 'success');
    } catch (error) {
      showToast(`❌ Erro ao exportar: ${error}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportStructuresCSV = () => {
    try {
      setIsProcessing(true);
      const store = getStore();
      const csv = exportStructuresAsCSV(store);
      const filename = `inspec360_estruturas_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csv, filename, 'csv');
      showToast('✅ Estruturas exportadas com sucesso!', 'success');
    } catch (error) {
      showToast(`❌ Erro ao exportar: ${error}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportOrdersCSV = () => {
    try {
      setIsProcessing(true);
      const store = getStore();
      const csv = exportServiceOrdersAsCSV(store);
      const filename = `inspec360_ordens_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csv, filename, 'csv');
      showToast('✅ Ordens de serviço exportadas com sucesso!', 'success');
    } catch (error) {
      showToast(`❌ Erro ao exportar: ${error}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportOrdersExcel = () => {
    try {
      setIsProcessing(true);
      const store = getStore();
      const excelBlob = exportServiceOrdersAsExcel(store);
      const filename = `inspec360_ordens_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadBlobFile(excelBlob, filename);
      showToast('✅ Ordens de serviço exportadas em Excel com sucesso!', 'success');
    } catch (error) {
      showToast(`❌ Erro ao exportar: ${error}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateBackup = () => {
    try {
      setIsProcessing(true);
      const store = getStore();
      createBackupInStorage(store);
      refreshBackupsList();
      showToast('✅ Backup criado com sucesso!', 'success');
    } catch (error) {
      showToast(`❌ Erro ao criar backup: ${error}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBackup = (timestamp: string) => {
    if (confirm('Tem certeza que deseja deletar este backup?')) {
      if (deleteBackup(timestamp)) {
        refreshBackupsList();
        showToast('✅ Backup deletado com sucesso!', 'success');
      } else {
        showToast('❌ Erro ao deletar backup', 'error');
      }
    }
  };

  const handleRestoreBackup = (timestamp: string) => {
    if (confirm('Restaurar este backup substituirá os dados atuais. Deseja continuar?')) {
      try {
        setIsProcessing(true);
        const data = restoreBackup(timestamp);
        if (data) {
          saveStore(data);
          window.location.reload(); // Recarregar página para aplicar dados
          showToast('✅ Backup restaurado com sucesso!', 'success');
        } else {
          showToast('❌ Erro ao restaurar backup', 'error');
        }
      } catch (error) {
        showToast(`❌ Erro ao restaurar: ${error}`, 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const data = await importDataFromFile(file);
      if (data) {
        saveStore(data);
        showToast('✅ Dados importados com sucesso! Recarregando...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      showToast(`❌ Erro ao importar: ${error}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#193A2A] to-[#2a5242] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Centro de Backup e Exportação</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {[
            { id: 'export', label: '📥 Exportar', icon: Download },
            { id: 'backups', label: '💾 Backups', icon: Database },
            { id: 'restore', label: '🔄 Restaurar', icon: RotateCcw },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BackupTab)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                activeTab === tab.id
                  ? 'text-[#193A2A] border-b-2 border-[#193A2A]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* EXPORT TAB */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <div className="text-blue-600 mt-1">ℹ️</div>
                <div>
                  <p className="font-semibold text-blue-900">Exportar Dados</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Baixe seus dados em diferentes formatos para análise ou backup seguro em dispositivo local.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {/* JSON Export */}
                <Card className="p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#193A2A] flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Exportar Dados Completos (JSON)
                      </h3>
                      <p className="text-gray-600 text-sm mt-2">
                        Exporta todos os dados do sistema em formato JSON. Pode ser usado para backup ou importação posterior.
                      </p>
                      <div className="mt-3 text-xs text-gray-500 space-y-1">
                        <p>• Inclui: Usuários, estruturas, ordens, inspeções, fotos e logs</p>
                        <p>• Tamanho estimado: ~{formatFileSize(JSON.stringify(getStore()).length)}</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleExportJSON}
                      disabled={isProcessing}
                      className="bg-[#193A2A] hover:bg-[#2a5242] text-white whitespace-nowrap"
                    >
                      {isProcessing ? '⏳ Processando...' : '📥 Exportar JSON'}
                    </Button>
                  </div>
                </Card>

                {/* CSV - Structures */}
                <Card className="p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#193A2A] flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Exportar Estruturas (CSV)
                      </h3>
                      <p className="text-gray-600 text-sm mt-2">
                        Exporta lista de estruturas (torres) para análise em Excel ou outro programa.
                      </p>
                      <div className="mt-3 text-xs text-gray-500">
                        <p>Total de estruturas: {getStore().structures.length}</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleExportStructuresCSV}
                      disabled={isProcessing}
                      className="bg-[#193A2A] hover:bg-[#2a5242] text-white whitespace-nowrap"
                    >
                      {isProcessing ? '⏳ Processando...' : '📊 Exportar CSV'}
                    </Button>
                  </div>
                </Card>

                {/* CSV - Orders */}
                <Card className="p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#193A2A] flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Exportar Ordens de Serviço (CSV)
                      </h3>
                      <p className="text-gray-600 text-sm mt-2">
                        Exporta todas as ordens de trabalho para relatórios e planejamento.
                      </p>
                      <div className="mt-3 text-xs text-gray-500">
                        <p>Total de ordens: {getStore().serviceOrders.length}</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleExportOrdersCSV}
                      disabled={isProcessing}
                      className="bg-[#193A2A] hover:bg-[#2a5242] text-white whitespace-nowrap"
                    >
                      {isProcessing ? '⏳ Processando...' : '📊 Exportar CSV'}
                    </Button>
                  </div>
                </Card>

                {/* Excel - Orders */}
                <Card className="p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#193A2A] flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Exportar Ordens de Serviço (Excel)
                      </h3>
                      <p className="text-gray-600 text-sm mt-2">
                        Exporta todas as ordens no formato .xlsx para análise avançada.
                      </p>
                      <div className="mt-3 text-xs text-gray-500">
                        <p>Inclui número manual, prazo, status e histórico de cada ordem.</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleExportOrdersExcel}
                      disabled={isProcessing}
                      className="bg-[#193A2A] hover:bg-[#2a5242] text-white whitespace-nowrap"
                    >
                      {isProcessing ? '⏳ Processando...' : '📄 Exportar Excel'}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* BACKUPS TAB */}
          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                <div className="text-green-600 mt-1">✓</div>
                <div>
                  <p className="font-semibold text-green-900">Backups Automáticos</p>
                  <p className="text-sm text-green-700 mt-1">
                    Crie e gerencie backups dos seus dados. Máximo de {backupsList.totalBackups} backups armazenados.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCreateBackup}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? '⏳ Criando backup...' : '💾 Criar Novo Backup Agora'}
              </Button>

              {backupsList.backups.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Backups Armazenados ({backupsList.backups.length})
                  </p>
                  {backupsList.backups.map(backup => (
                    <div key={backup.timestamp} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {backup.dateHuman}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <HardDrive className="w-4 h-4 inline mr-1" />
                            Tamanho: {formatFileSize(backup.dataSize)} | Hash: {backup.hash}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreBackup(backup.timestamp)}
                            disabled={isProcessing}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restaurar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBackup(backup.timestamp)}
                            disabled={isProcessing}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Deletar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum backup criado ainda</p>
                </div>
              )}
            </div>
          )}

          {/* RESTORE TAB */}
          {activeTab === 'restore' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Atenção ao Restaurar</p>
                  <p className="text-sm text-amber-700 mt-1">
                    A restauração substituirá todos os dados atuais. Certifique-se de ter um backup dos dados atuais antes de prosseguir.
                  </p>
                </div>
              </div>

              <Card className="p-6 border-dashed border-2">
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-700 font-semibold mb-4">Importar Arquivo de Backup</p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      disabled={isProcessing}
                      className="hidden"
                    />
                    <Button
                      as="span"
                      className="bg-[#193A2A] hover:bg-[#2a5242] text-white cursor-pointer"
                      disabled={isProcessing}
                    >
                      {isProcessing ? '⏳ Importando...' : '📁 Selecionar Arquivo JSON'}
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-4">Apenas arquivos .json são aceitos</p>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`border-t px-6 py-3 flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : toast.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Clock className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{toast.msg}</span>
          </div>
        )}
      </Card>
    </div>
  );
}
