import React, { useState } from 'react';
import type { ExecutionState } from '@shared/types';
import type { ExecutionListItem } from '../api/executionsApi';
import type { ExecutionWithDetails } from '../types';
import { ExecutionDetailModal } from './ExecutionDetailModal';
import { getExecutionDetails, updateExecutionState } from '../api/executionsApi';
import { ExecutionTable, ColumnDef } from './ExecutionTable';
import {
  Play,
  Pause,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  Plus,
  Search,
} from 'lucide-react';

interface ExecutionManagementPanelProps {
  executions: ExecutionListItem[];
  onRefresh: () => void;
  onResumeExecution: (executionId: number) => void;
  onSuccessFeedback?: (message: string) => void;
  onCreateAndExecute?: () => void;
  onSearchProcedures?: () => void;
}

export const ExecutionManagementPanel: React.FC<ExecutionManagementPanelProps> = ({
  executions,
  onRefresh,
  onResumeExecution,
  onSuccessFeedback,
  onCreateAndExecute,
  onSearchProcedures,
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
    // ── Req 2: Si la ejecución tiene correcciones pendientes, NO cambiar a ACTIVE.
    // Mantener HAS_CORRECTIONS para que al pausar dentro de la vista conserve ese estado.
    const target = executions.find((e) => e.id === executionId);
    if (target?.state !== 'HAS_CORRECTIONS') {
      await updateExecutionState(executionId, 'ACTIVE');
    }
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
          <span className="w-25 justify-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-black border border-black">
            <Pause className="w-3 h-3" /> Pausa
          </span>
        );
      case 'PENDING_EVALUATION':
        return (
          <span className="w-25 justify-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#00707E]/80 text-white border border-gray-300">
            <Clock className="w-3 h-3 text-white" /> Evaluando
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
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-end gap-1.5 h-8 z-20 bg-white/95 backdrop-blur-xs hover:pl-8 py-4 rounded-lg "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Reanudar */}
        {(execution.state === 'PAUSED' || execution.state === 'HAS_CORRECTIONS') && (
          <button
            type="button"
            onClick={() => handleResume(execution.id)}
            className={`group relative inline-flex items-center justify-center w-7 h-7 hover:w-32 text-white rounded-md shadow-xs overflow-hidden transition-all duration-500 ease-in-out cursor-pointer px-2 hover:px-3 ${execution.state === 'PAUSED'
              ? 'bg-black '
              : 'bg-red-600 '
              }`}
            title="Reanudar Ejecución"
          >
            {/* gap-0 por defecto, gap-1.5 solo al hacer hover */}
            <div className="flex items-center justify-center gap-0 group-hover:gap-1.5 w-full transition-all duration-500">
              <Play className="w-3 h-3 fill-current shrink-0" />
              <span className="max-w-0 group-hover:max-w-[90px] opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out text-xs font-medium text-left">
                Reanudar
              </span>
            </div>
          </button>
        )}

        {/* Botón Cancelar */}
        {(execution.state === 'PAUSED' || execution.state === 'HAS_CORRECTIONS') && (
          <button
            type="button"
            onClick={() => setCancelCandidate(execution)}
            className="group relative inline-flex items-center justify-center w-7 h-7 hover:w-32 text-gray-600 hover:text-red-700 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-md overflow-hidden transition-all duration-500 ease-in-out cursor-pointer px-2 hover:px-3 shadow-2xs"
            title="Cancelar Ejecución"
          >
            {/* gap-0 por defecto, gap-1.5 solo al hacer hover */}
            <div className="flex items-center justify-center gap-0 group-hover:gap-1.5 w-full transition-all duration-500">
              <XCircle className="w-3 h-3 shrink-0" />
              <span className="max-w-0 group-hover:max-w-[90px] opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out text-xs font-medium text-left">
                Cancelar
              </span>
            </div>
          </button>
        )}
      </div>
    );
  };

  // Definición de columnas para cada tabla centralizada
  const correctionColumns: ColumnDef[] = [
    {
      key: 'startedAt',
      header: 'Inicio',
      className: 'px-4 py-3 text-gray-600',
      render: (execution) => new Date(execution.startedAt).toLocaleDateString(),
    },
    { key: 'procedure', header: 'Procedimiento' },
    { key: 'project', header: 'Proyecto' },
    {
      key: 'progress',
      header: 'Progreso',
      className: 'px-4 py-3',
      render: () => (
        <span className="text-red-800 font-semibold">
          0/3 Correcciones Resueltas
        </span>
      ),
    },
    {
      key: 'evaluated',
      header: 'Evaluado',
      className: 'px-4 py-3 text-gray-600',
      render: (execution) =>
        execution.endedAt
          ? new Date(execution.endedAt).toLocaleDateString()
          : new Date(execution.startedAt).toLocaleDateString(),
    },
  ];

  const pausedColumns: ColumnDef[] = [
    {
      key: 'startedAt',
      header: 'Inicio',
      className: 'px-4 py-3 text-gray-600',
      render: (execution) => new Date(execution.startedAt).toLocaleDateString(),
    },
    { key: 'procedure', header: 'Procedimiento' },
    { key: 'project', header: 'Proyecto' },
    {
      key: 'progress',
      header: 'Progreso',
      className: 'px-4 py-3',
      render: (execution) => (
        <div>
          <div className="font-semibold text-gray-900">
            {execution.completedSteps}/{execution.totalSteps} Pasos
          </div>
        </div>
      ),
    },
  ];

  const historyColumns: ColumnDef[] = [
    {
      key: 'startedAt',
      header: 'Inicio',
      className: 'px-4 py-3 text-gray-600',
      render: (execution) => new Date(execution.startedAt).toLocaleDateString(),
    },
    { key: 'procedure', header: 'Procedimiento' },
    {
      key: 'state',
      header: 'Estado',
      // Usamos flex y justify-center para asegurar que el badge quede perfectamente centrado
      headerClassName: 'text-center px-4 py-3',
      className: 'text-center px-4 py-3',
      render: (execution) => (
        <div className="flex justify-center">
          {renderStateBadge(execution.state)}
        </div>
      ),
    },
    {
      key: 'project',
      header: 'Proyecto',
      headerClassName: 'text-right px-4 py-3',
      className: 'text-right px-4 py-3',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Botones de acción superior: Crear y Ejecutar / Buscar Procedimientos */}
      <div className="flex flex-wrap items-center justify-end gap-3 pb-2">
        <button
          type="button"
          onClick={onSearchProcedures}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
        >
          <Search className="w-4 h-4 text-gray-500" />
          <span>Buscar Procedimientos</span>
        </button>

        <button
          type="button"
          onClick={onCreateAndExecute}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear y Ejecutar</span>
        </button>
      </div>

      {/* Seccion 1 */}
      <div className="rounded-lg bg-rose-50 border border-rose-200/80 p-5 shadow-sm transition-all duration-300 hover:shadow-md space-y-4 -mx-6 px-6">
        <div>
          <div className="flex items-center justify-between group relative">
            <div className="flex items-center gap-3">
              <h2 className="cursor-default text-base font-bold text-gray-900 tracking-wide flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 transition-transform duration-200 group-hover:scale-105" />
                Corregir
              </h2>
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-2 text-xs font-semibold rounded-full bg-red-600 text-white shadow-2xs">
                {correctionExecutions.length}
              </span>
            </div>
          </div>
          <hr className="border-t border-rose-200 mt-3" />
        </div>

        <div className="overflow-hidden rounded-md border border-rose-200/60 bg-white">
          <ExecutionTable
            data={correctionExecutions}
            columns={correctionColumns}
            onRowClick={(execution) => handleOpenDetails(execution.id)}
            renderActions={renderActionButtons}
            emptyMessage="No hay ejecuciones pendientes de corrección actualmente."
            emptyClassName="p-4 bg-white text-center text-xs text-gray-500"
            headerClassName="bg-rose-100/60 border-b border-rose-200"
            headerTextClassName="text-rose-900"
            rowHoverClassName="hover:bg-rose-50/40"
            divideClassName="divide-rose-100"
            procedureHoverColor="red"
          />
        </div>
      </div>

      {/* SECCIÓN 2: EN PAUSA */}
      <div className="rounded-lg bg-gray-50/80 border border-gray-200 p-5 shadow-2xs transition-all duration-300 hover:shadow-sm space-y-4 -mx-6 px-6">
        <div>
          <div className="flex items-center justify-between group relative">
            <div className="flex items-center gap-3">
              <h2 className="cursor-default text-base font-bold text-gray-900 tracking-wide flex items-center gap-2">
                <Pause className="w-5 h-5 text-black transition-transform duration-200 group-hover:scale-105" />
                Pausados
              </h2>
              {/* Badge con cantidad en negro puro */}
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-2 text-xs font-semibold rounded-full bg-black text-white shadow-2xs">
                {pausedExecutions.length}
              </span>
            </div>
          </div>
          <hr className="border-t border-gray-200 mt-3" />
        </div>

        {/* Contenedor wrapper limpio con bordes sutiles en escala de grises */}
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <ExecutionTable
            data={pausedExecutions}
            columns={pausedColumns}
            onRowClick={(execution) => handleOpenDetails(execution.id)}
            renderActions={renderActionButtons}
            emptyMessage="No tienes ejecuciones pausadas en este momento."
            emptyClassName="p-4 bg-white text-center text-xs text-gray-500"
            // Propiedades estilizadas para la temática blanco y negro minimalista
            headerClassName="bg-gray-100/70 border-b border-gray-200"
            headerTextClassName="text-gray-800"
            rowHoverClassName="hover:bg-gray-50"
            divideClassName="divide-gray-100"
            procedureHoverColor="blue"
          />
        </div>
      </div>

      {/* SECCIÓN 3: VISTA GENERAL CON FILTROS (Requerimiento 2: texto plano + cuadrado con número) */}
      <div className="space-y-4 pt-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Historial de Ejecuciones</h2>
          </div>
          <hr className="border-t border-gray-200 mt-2" />
        </div>

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


          {/* Evaluación Pendiente */}
          <button
            type="button"
            onClick={() => setActiveTab('PENDING_EVALUATION')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${activeTab === 'PENDING_EVALUATION'
              ? 'bg-[#00707E] text-white border-[#00707E] shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
          >
            <span>Evaluación Pendiente</span>
            <span
              className={`inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-xs text-[11px] font-bold ${activeTab === 'PENDING_EVALUATION' ? 'bg-[#00424B] text-white' : 'bg-[#00707E] text-white'
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
          <ExecutionTable
            data={filteredExecutions}
            columns={historyColumns}
            onRowClick={(execution) => handleOpenDetails(execution.id)}
            emptyMessage="No se encontraron ejecuciones en este estado."
            emptyClassName="p-8 text-center text-gray-400 text-xs"
            rowHoverClassName="hover:bg-gray-50/80"
            divideClassName="divide-gray-200"
            procedureHoverColor="blue"
          />
        </div>
      </div>

      {/* Modal de Detalle de Ejecución */}
      {
        selectedExecutionDetails && (
          <ExecutionDetailModal
            execution={selectedExecutionDetails}
            onClose={() => setSelectedExecutionDetails(null)}
            onResume={handleResume}
          />
        )
      }

      {/* Modal para Confirmar Cancelación de Ejecución */}
      {
        cancelCandidate && (
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
        )
      }
    </div >
  );
};
