import React, { useState } from 'react';
import type { ExecutionState } from '@shared/types';
import type { ExecutionListItem } from '../api/executionsApi';
import type { ExecutionWithDetails } from '../types';
import { ExecutionDetailModal } from './ExecutionDetailModal';
import { getExecutionDetails, updateExecutionState } from '../api/executionsApi';

interface ExecutionManagementPanelProps {
  executions: ExecutionListItem[];
  onRefresh: () => void;
  onResumeExecution: (executionId: number) => void;
  onSuccessFeedback?: (message: string) => void;
}

export const ExecutionManagementPanel: React.FC<ExecutionManagementPanelProps> = ({
  executions,
  onRefresh,
  onResumeExecution,
  onSuccessFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<ExecutionState | 'ALL'>('ALL');
  const [selectedExecutionDetails, setSelectedExecutionDetails] = useState<ExecutionWithDetails | null>(null);
  const [cancelCandidate, setCancelCandidate] = useState<ExecutionListItem | null>(null);

  // Filter according to active tab
  const filteredExecutions = executions.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.state === activeTab;
  });

  // Priority sections
  const pausedExecutions = executions.filter((item) => item.state === 'PAUSED');
  const correctionExecutions = executions.filter((item) => item.state === 'HAS_CORRECTIONS');

  const handleOpenDetails = async (executionId: number) => {
    const details = await getExecutionDetails(executionId);
    if (details) {
      setSelectedExecutionDetails(details);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelCandidate) return;
    await updateExecutionState(cancelCandidate.id, 'CANCELLED');
    setCancelCandidate(null);
    if (onSuccessFeedback) {
      onSuccessFeedback(`Ejecución #${cancelCandidate.id} cancelada.`);
    }
    onRefresh();
  };

  const handleResume = async (executionId: number) => {
    await updateExecutionState(executionId, 'ACTIVE');
    if (selectedExecutionDetails?.id === executionId) {
      setSelectedExecutionDetails(null);
    }
    onResumeExecution(executionId);
  };

  const renderStateBadge = (state: ExecutionState) => {
    switch (state) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            Activa
          </span>
        );
      case 'HAS_CORRECTIONS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
            Pendiente Corrección
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            Pausada
          </span>
        );
      case 'PENDING_EVALUATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-white">
            Pendiente Evaluación
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-300">
            Cancelada
          </span>
        );
      case 'APPROVED_FINISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            Aprobada
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Gestión de Ejecuciones
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Supervisa el estado de todas tus ejecuciones: pausadas, activas, en evaluación y finalizadas.
        </p>
      </div>

      {/* Priority Section: Pausadas & Pendientes de Corrección */}
      {(pausedExecutions.length > 0 || correctionExecutions.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pausedExecutions.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Ejecuciones Pausadas ({pausedExecutions.length})
                </span>
              </div>
              <div className="space-y-2">
                {pausedExecutions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-lg border border-amber-200 shadow-2xs flex items-center justify-between text-xs cursor-pointer hover:border-amber-400"
                    onClick={() => handleOpenDetails(item.id)}
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 truncate max-w-xs">
                        {item.procedureName}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.lastProgress}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResume(item.id);
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Reanudar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {correctionExecutions.length > 0 && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Pendientes de Corrección ({correctionExecutions.length})
                </span>
              </div>
              <div className="space-y-2">
                {correctionExecutions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-lg border border-red-200 shadow-2xs flex items-center justify-between text-xs cursor-pointer hover:border-red-400"
                    onClick={() => handleOpenDetails(item.id)}
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 truncate max-w-xs">
                        {item.procedureName}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.lastProgress}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(item.id);
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-xs shadow-xs cursor-pointer"
                    >
                      Ver Correcciones
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs Filter */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-2 overflow-x-auto pb-2 text-xs">
          {(
            [
              { key: 'ALL', label: 'Todas' },
              { key: 'ACTIVE', label: 'Activas' },
              { key: 'PAUSED', label: 'Pausadas' },
              { key: 'PENDING_EVALUATION', label: 'En Evaluación' },
              { key: 'HAS_CORRECTIONS', label: 'Con Correcciones' },
              { key: 'APPROVED_FINISHED', label: 'Aprobadas' },
              { key: 'CANCELLED', label: 'Canceladas' },
            ] as const
          ).map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Executions Table / List (HU-011 CA 1 & CA 2) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-5 py-3">Procedimiento</th>
                <th className="px-5 py-3">Proyecto</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Progreso</th>
                <th className="px-5 py-3">Fecha Inicio</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExecutions.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                  onClick={() => handleOpenDetails(item.id)}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-gray-900">{item.procedureName}</div>
                    <div className="text-[10px] text-gray-400">ID: #{item.id}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{item.projectName}</td>
                  <td className="px-5 py-3.5">{renderStateBadge(item.state)}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-gray-700 font-medium">
                      {item.completedSteps} / {item.totalSteps} pasos
                    </span>
                    <span className="block text-[10px] text-gray-400 truncate max-w-xs">
                      {item.lastProgress}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                    {new Date(item.startedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {item.state === 'PAUSED' && (
                        <button
                          type="button"
                          onClick={() => handleResume(item.id)}
                          className="px-2.5 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded shadow-xs cursor-pointer"
                        >
                          Reanudar
                        </button>
                      )}
                      {item.state === 'ACTIVE' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleResume(item.id)}
                            className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-xs cursor-pointer"
                          >
                            Continuar
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelCandidate(item)}
                            className="px-2 py-1 text-xs text-gray-400 hover:text-red-600 rounded cursor-pointer"
                            title="Cancelar ejecución"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(item.id)}
                        className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded hover:bg-gray-100 cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredExecutions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xs text-gray-400 italic">
                    No se encontraron ejecuciones para el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Detail Modal (HU-011 CA 2) */}
      {selectedExecutionDetails && (
        <ExecutionDetailModal
          execution={selectedExecutionDetails}
          onClose={() => setSelectedExecutionDetails(null)}
          onResume={handleResume}
        />
      )}

      {/* Cancel Confirmation Modal (HU-011 CA 5) */}
      {cancelCandidate && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Confirmar Cancelación</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              ¿Está seguro de que desea cancelar la ejecución de{' '}
              <span className="font-semibold text-gray-900">{cancelCandidate.procedureName}</span>?
              No permitirá nuevas modificaciones pero quedará registrada en la lista de canceladas.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelCandidate(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded shadow-xs"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
