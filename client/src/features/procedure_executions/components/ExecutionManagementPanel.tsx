import React, { useState } from 'react';
import type { ExecutionState } from '@shared/types';
import type { ExecutionListItem } from '../api/executionsApi';
import type { ExecutionWithDetails } from '../types';
import { ExecutionDetailModal } from './ExecutionDetailModal';
import { getExecutionDetails, updateExecutionState } from '../api/executionsApi';
import {
  Play,
  Pause,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

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
  // Tabs sin 'ACTIVE'
  const [activeTab, setActiveTab] = useState<Exclude<ExecutionState, 'ACTIVE'> | 'ALL'>('ALL');
  const [selectedExecutionDetails, setSelectedExecutionDetails] = useState<ExecutionWithDetails | null>(null);
  const [cancelCandidate, setCancelCandidate] = useState<ExecutionListItem | null>(null);

  // Filtrado según pestañas de estado de la vista general (excluye 'ACTIVE')
  const filteredExecutions = executions
    .filter((item) => item.state !== 'ACTIVE')
    .filter((item) => {
      if (activeTab === 'ALL') return true;
      return item.state === activeTab;
    });

  // Secciones prioritarias
  const correctionExecutions = executions.filter((item) => item.state === 'HAS_CORRECTIONS');
  const pausedExecutions = executions.filter((item) => item.state === 'PAUSED');
  const pendingEvaluationExecutions = executions.filter((item) => item.state === 'PENDING_EVALUATION');
  const approvedExecutions = executions.filter((item) => item.state === 'APPROVED_FINISHED');
  const cancelledExecutions = executions.filter((item) => item.state === 'CANCELLED');
  const totalCount = executions.filter((e) => e.state !== 'ACTIVE').length;

  // Total de ejecuciones en proceso: Pausadas + Con corrección + Evaluación pendiente
  const totalInProcessCount =
    pausedExecutions.length + correctionExecutions.length + pendingEvaluationExecutions.length;

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

  // Render State Badge: Requerimiento 1 -> 'Corregir' en vez de 'Pendiente Corrección'
  const renderStateBadge = (state: ExecutionState) => {
    switch (state) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <Play className="w-3 h-3 fill-current" /> Activo
          </span>
        );
      case 'HAS_CORRECTIONS':
        return (
          <span className="w-25 justify-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-xs">
            <AlertCircle className="w-3.5 h-3.5" /> Corregir
          </span>
        );
      case 'PAUSED':
        return (
          <span className="w-25 justify-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Pause className="w-3 h-3" /> Pausa
          </span>
        );
      case 'PENDING_EVALUATION':
        return (
          <span className="w-25 justify-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 border border-gray-300">
            <Clock className="w-3 h-3 text-gray-500" /> Evaluando
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="w-25 justify-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        );
      case 'APPROVED_FINISHED':
        return (
          <span className="w-25 justify-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Aprobado
          </span>
        );
    }
  };

  const renderActionButtons = (execution: ExecutionListItem) => {
    return (
      <div className="flex items-center justify-end gap-1.5 h-7" onClick={(e) => e.stopPropagation()}>
        {/* Botón Ver Detalle */}
        <button
          type="button"
          onClick={() => handleOpenDetails(execution.id)}
          className="inline-flex items-center justify-center w-7 h-7 text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors cursor-pointer"
          title="Ver Detalle"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Botón Reanudar (Si está Pausada o con Correcciones) */}
        {(execution.state === 'PAUSED' || execution.state === 'HAS_CORRECTIONS') && (
          <button
            type="button"
            onClick={() => handleResume(execution.id)}
            className="inline-flex items-center justify-center gap-1 h-7 px-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors cursor-pointer"
            title="Reanudar Ejecución"
          >
            <Play className="w-3 h-3 fill-current" /> Reanudar
          </button>
        )}

        {/* Botón Cancelar (Si está Pausada o con Correcciones) */}
        {(execution.state === 'PAUSED' || execution.state === 'HAS_CORRECTIONS') && (
          <button
            type="button"
            onClick={() => setCancelCandidate(execution)}
            className="inline-flex items-center justify-center gap-1 h-7 px-2.5 text-xs font-medium text-gray-600 hover:text-red-700 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-md transition-colors cursor-pointer"
            title="Cancelar Ejecución"
          >
            <XCircle className="w-3 h-3" /> Cancelar
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">


      {/* SECCIÓN 1: CORREGIR (Requerimiento 1 & 3: Lista-tabla con motivo de corrección) */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-red-600 uppercase tracking-wide flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Corregir
            </h2>
            {/* Cuadrado con cantidad */}
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold rounded-xs bg-red-500 text-white shadow-2xs">
              {correctionExecutions.length}
            </span>
          </div>
          <p className="text-xs text-red-700 mt-1">
            Observaciones devueltas por el revisor que requieren ajustes del desarrollador.
          </p>
          <hr className="border-t border-red-300 mt-2" />
        </div>

        {correctionExecutions.length > 0 ? (

          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">ID / Procedimiento</th>
                <th className="px-4 py-3">Proyecto</th>
                <th className="px-4 py-3">Motivo de Corrección</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-100 text-xs">
              {correctionExecutions.map((execution) => (
                <tr
                  key={execution.id}
                  className="hover:bg-red-50/40 transition cursor-pointer"
                  onClick={() => handleOpenDetails(execution.id)}
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900 text-sm hover:text-red-700 transition-colors">
                      #{execution.id} - {execution.procedureName}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Iniciado: {new Date(execution.startedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {execution.projectName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="p-2 bg-red-50 rounded-md border border-red-200/80 text-xs text-red-900 font-medium flex items-start gap-1.5 max-w-lg">
                      <span className="font-bold shrink-0 text-red-800">Observación:</span>
                      <span>{execution.lastProgress}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {renderActionButtons(execution)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        ) : (
          <div className="p-4 bg-white rounded-xl border border-dashed border-red-200 text-center text-xs text-gray-500">
            No hay ejecuciones pendientes de corrección actualmente.
          </div>
        )}
      </div>

      {/* SECCIÓN 2: EN PAUSA (Requerimiento 3: Formato lista-tabla igual a todas las ejecuciones) */}
      <div className="space-y-3 pt-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Pause className="w-5 h-5 text-amber-600" />
              En Pausa
            </h2>
            {/* Cuadrado con cantidad */}
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold rounded-xs bg-amber-500 text-white shadow-2xs">
              {pausedExecutions.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Procedimientos detenidos temporalmente que puedes reanudar en cualquier momento.
          </p>
          <hr className="border-t border-gray-200 mt-2" />
        </div>

        {pausedExecutions.length > 0 ? (

          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">ID / Procedimiento</th>
                <th className="px-4 py-3">Proyecto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Progreso</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {pausedExecutions.map((execution) => (
                <tr
                  key={execution.id}
                  className="hover:bg-amber-50/30 transition cursor-pointer"
                  onClick={() => handleOpenDetails(execution.id)}
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900 text-sm hover:text-blue-600 transition-colors">
                      #{execution.id} - {execution.procedureName}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Iniciado: {new Date(execution.startedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {execution.projectName}
                  </td>
                  <td className="px-4 py-3">{renderStateBadge(execution.state)}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">
                      {execution.completedSteps}/{execution.totalSteps} Pasos
                    </div>
                    <div className="text-gray-400 truncate max-w-xs">{execution.lastProgress}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {renderActionButtons(execution)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        ) : (
          <div className="p-4 bg-white rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-500">
            No tienes ejecuciones pausadas en este momento.
          </div>
        )}
      </div>

      {/* SECCIÓN 3: VISTA GENERAL CON FILTROS (Requerimiento 2: texto plano + cuadrado con número) */}
      <div className="space-y-4 pt-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Historial y Todas las Ejecuciones</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span>Total listadas</span>
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-bold rounded-xs bg-slate-800 text-white">
                {filteredExecutions.length}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Filtra y visualiza el estado completo del historial de ejecuciones.
          </p>
          <hr className="border-t border-gray-200 mt-2" />
        </div>

        {/* Pestañas de Filtro por Estado (Requerimiento 2: Nombre en texto plano + cuadrado con número del color de la categoría) */}
        <div className="flex flex-wrap gap-2 pb-1">
          {/* Todas */}
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${activeTab === 'ALL'
              ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
          >
            <span>Todas</span>
            <span
              className={`inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-xs text-[11px] font-bold ${activeTab === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white'
                }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Corregir */}
          <button
            type="button"
            onClick={() => setActiveTab('HAS_CORRECTIONS')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${activeTab === 'HAS_CORRECTIONS'
              ? 'bg-red-600 text-white border-red-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-700'
              }`}
          >
            <span>Corregir</span>
            <span
              className={`inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-xs text-[11px] font-bold ${activeTab === 'HAS_CORRECTIONS' ? 'bg-red-700 text-white' : 'bg-red-500 text-white'
                }`}
            >
              {correctionExecutions.length}
            </span>
          </button>

          {/* En Pausa */}
          <button
            type="button"
            onClick={() => setActiveTab('PAUSED')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${activeTab === 'PAUSED'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50 hover:text-amber-800'
              }`}
          >
            <span>En Pausa</span>
            <span
              className={`inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-xs text-[11px] font-bold ${activeTab === 'PAUSED' ? 'bg-amber-700 text-white' : 'bg-amber-500 text-white'
                }`}
            >
              {pausedExecutions.length}
            </span>
          </button>

          {/* Evaluación Pendiente */}
          <button
            type="button"
            onClick={() => setActiveTab('PENDING_EVALUATION')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${activeTab === 'PENDING_EVALUATION'
              ? 'bg-gray-700 text-white border-gray-700 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
          >
            <span>Evaluación Pendiente</span>
            <span
              className={`inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-xs text-[11px] font-bold ${activeTab === 'PENDING_EVALUATION' ? 'bg-gray-800 text-white' : 'bg-gray-400 text-white'
                }`}
            >
              {pendingEvaluationExecutions.length}
            </span>
          </button>

          {/* Aprobadas */}
          <button
            type="button"
            onClick={() => setActiveTab('APPROVED_FINISHED')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${activeTab === 'APPROVED_FINISHED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
          >
            <span>Aprobadas</span>
            <span
              className={`inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-xs text-[11px] font-bold ${activeTab === 'APPROVED_FINISHED' ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'
                }`}
            >
              {approvedExecutions.length}
            </span>
          </button>

          {/* Canceladas */}
          <button
            type="button"
            onClick={() => setActiveTab('CANCELLED')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${activeTab === 'CANCELLED'
              ? 'bg-gray-600 text-white border-gray-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
          >
            <span>Canceladas</span>
            <span
              className={`inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-xs text-[11px] font-bold ${activeTab === 'CANCELLED' ? 'bg-gray-700 text-white' : 'bg-gray-500 text-white'
                }`}
            >
              {cancelledExecutions.length}
            </span>
          </button>
        </div>

        {/* Tabla formal de la Vista Filtrada */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-xs">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">ID / Procedimiento</th>
                <th className="px-4 py-3">Proyecto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Progreso</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {filteredExecutions.map((execution) => (
                <tr
                  key={execution.id}
                  className="hover:bg-gray-50/80 transition cursor-pointer"
                  onClick={() => handleOpenDetails(execution.id)}
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900 text-sm">
                      #{execution.id} - {execution.procedureName}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Iniciado: {new Date(execution.startedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {execution.projectName}
                  </td>
                  <td className="px-4 py-3">{renderStateBadge(execution.state)}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">
                      {execution.completedSteps}/{execution.totalSteps} Pasos
                    </div>
                    <div className="text-gray-400 truncate max-w-xs">{execution.lastProgress}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {renderActionButtons(execution)}
                  </td>
                </tr>
              ))}

              {filteredExecutions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-xs">
                    No se encontraron ejecuciones en este estado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle de Ejecución */}
      {selectedExecutionDetails && (
        <ExecutionDetailModal
          execution={selectedExecutionDetails}
          onClose={() => setSelectedExecutionDetails(null)}
          onResume={handleResume}
        />
      )}

      {/* Modal para Confirmar Cancelación de Ejecución */}
      {cancelCandidate && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-full bg-red-100 text-red-600">
                <XCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-900">Confirmar Cancelación</h3>
                <p className="text-xs text-gray-500">ID Ejecución: #{cancelCandidate.id}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              ¿Está seguro de que desea cancelar la ejecución de{' '}
              <span className="font-semibold text-gray-900">{cancelCandidate.procedureName}</span>?
              Esta acción no permitirá nuevas modificaciones, pero quedará registrada permanentemente en la lista de canceladas.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelCandidate(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
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
