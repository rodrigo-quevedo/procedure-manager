import React, { useState } from 'react';
import type { ProcedureWithDetails, StepWithSections } from '../types';
import { StepNavigation } from './StepNavigation';
import { StepDetailView } from './StepDetailView';
import type { Input, Execution } from '@shared/types';
import {
  X,
  Play,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Percent,
  User,
  Tags,
} from 'lucide-react';

interface ProcedureDetailModalProps {
  procedure: ProcedureWithDetails;
  executions?: Execution[];
  onClose: () => void;
  onExecute: (procedureId: number) => void;
}

export const ProcedureDetailModal: React.FC<ProcedureDetailModalProps> = ({
  procedure,
  executions = [],
  onClose,
  onExecute,
}) => {
  const steps: StepWithSections[] = procedure.steps || [];
  const [selectedStepId, setSelectedStepId] = useState<number>(
    steps.length > 0 ? steps[0].id : 1
  );

  const selectedStep = steps.find((s) => s.id === selectedStepId) || steps[0];
  const stepNumber = steps.findIndex((s) => s.id === selectedStepId) + 1;

  // Métricas de ejecuciones
  // Totales = Aprobadas + En Pausa + Con Correcciones + Canceladas
  const approvedCount = executions.filter((e) => e.state === 'APPROVED_FINISHED').length;
  const pausedCount = executions.filter((e) => e.state === 'PAUSED').length;
  const correctionsCount = executions.filter((e) => e.state === 'HAS_CORRECTIONS').length;
  const cancelledCount = executions.filter((e) => e.state === 'CANCELLED').length;
  const evaluationPendingCount = executions.filter((e) => e.state === 'PENDING_EVALUATION').length;

  const totalExecutions = approvedCount + pausedCount + correctionsCount + cancelledCount + evaluationPendingCount;

  // Tasa de éxito: (Aprobadas / Totales) * 100
  const successRate = totalExecutions > 0 ? Math.round((approvedCount / totalExecutions) * 100) : 0;

  // Mapa de inputs vacío en modo consulta de procedimiento
  const emptyInputsMap: Record<number, Input> = {};

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Superior del Modal */}
        <div className="px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              {procedure.state || 'ACTIVO'}
            </span>
            <div className="h-4 w-px bg-gray-200" />
            <h2 className="text-base font-bold text-gray-900 truncate">
              {procedure.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 rounded-lg p-1 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sección de Metadatos del Procedimiento: Métricas y Desglose de Ejecuciones */}
        <div className="bg-gray-50/80 border-b border-gray-200 px-6 py-3 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            {/* 1. Cantidad de ejecuciones totales */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-blue-500" /> Ejecuciones Totales
              </span>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{totalExecutions}</p>
            </div>

            {/* 2. Énfasis en Aprobadas (Finalizadas) */}
            <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobadas
              </span>
              <p className="font-bold text-emerald-800 text-sm mt-0.5">
                {approvedCount}{' '}
                <span className="text-[10px] font-normal text-emerald-600">finalizadas</span>
              </p>
            </div>

            {/* 3. Tasa de Éxito */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3 h-3 text-indigo-500" /> Tasa de Éxito
              </span>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{successRate}%</p>
            </div>

            {/* 4. En Pausa */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" /> En Pausa
              </span>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{pausedCount}</p>
            </div>

            {/* 5. Correcciones Pendientes */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500" /> Con Correcciones
              </span>
              <p className="font-bold text-rose-600 text-sm mt-0.5">{correctionsCount}</p>
            </div>

            {/* 6. Canceladas */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3 h-3 text-gray-400" /> Canceladas
              </span>
              <p className="font-bold text-gray-700 text-sm mt-0.5">{cancelledCount}</p>
            </div>
          </div>
        </div>

        {/* Cuerpo Principal: Réplica de la vista con navegación a la izquierda y detalle a la derecha */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {!selectedStep ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              No hay pasos disponibles en este procedimiento.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Barra lateral de Navegación de Pasos y Metadatos del Procedimiento */}
              <div className="w-full md:w-64 shrink-0 space-y-5">
                {/* Navegación de Pasos */}
                <div>
                  <StepNavigation
                    steps={steps}
                    selectedStepId={selectedStepId}
                    onSelectStep={setSelectedStepId}
                    canReorder={false}
                  />
                </div>

                {/* Metadatos adicionales abajo de navegación como en Create and Execute View */}


                {/* 2. Proyecto Asignado */}
                {/* <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                    Proyecto Asignado
                  </label>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white p-2 rounded-lg border border-gray-200/80">
                    <FolderKanban className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{procedure.projectName || `Proyecto #${procedure.idProject}`}</span>
                  </div>
                </div> */}

                {/* Categorías / Tags */}
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                    Categorías
                  </label>
                  <div className="flex flex-wrap gap-1 bg-white p-2 rounded-lg border border-gray-200/80">
                    {procedure.tags && procedure.tags.length > 0 ? (
                      procedure.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100"
                        >
                          <Tags className="w-2.5 h-2.5 text-red-500" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">General</span>
                    )}
                  </div>
                </div>

                {/* 3. Nombre del Procedimiento */}
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                    Nombre
                  </label>
                  <p className="text-xs font-semibold text-gray-800 leading-snug bg-white p-2 rounded-lg border border-gray-200/80">
                    {procedure.name}
                  </p>
                </div>

                {/* 4. Descripción del Procedimiento */}
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                    Descripción
                  </label>
                  <p className="text-xs text-gray-600 leading-snug bg-white p-2 rounded-lg border border-gray-200/80">
                    {procedure.description || 'Sin descripción.'}
                  </p>
                </div>
                {/* 5. Creador / Autor */}
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                    Aprobado Por
                  </label>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 bg-white p-2 rounded-lg border border-gray-200/80">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{procedure.approverName || 'Juan Pérez'}</span>
                  </div>
                </div>
              </div>

              {/* Vista de Detalle del Paso (Sólo lectura de la definición) */}
              <div className="flex-1 w-full min-w-0">
                <StepDetailView
                  step={selectedStep}
                  stepNumber={stepNumber}
                  totalSteps={steps.length}
                  inputsMap={emptyInputsMap}
                  isExecutable={false}
                  canEditDefinition={false}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="text-xs text-gray-500">
            Vista de sólo lectura de la estructura y pasos del procedimiento.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={() => onExecute(procedure.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Iniciar Ejecución
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
