import React, { useState, useEffect } from 'react';
import type { ExecutionWithDetails } from '../types';
import type { ProcedureWithDetails, StepWithSections } from '@/features/procedures/types';
import { getProcedureDetails } from '@/features/procedures/api/proceduresApi';
import { StepNavigation } from '@/features/procedures/components/StepNavigation';
import { StepDetailView } from '@/features/procedures/components/StepDetailView';
import { EXECUTION_STATE_LABELS } from '@shared/types';
import type { Input } from '@shared/types';
import {
  ShieldCheck,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  X,
  PlaySquare,
  FolderKanban,
  User,
} from 'lucide-react';

interface ExecutionDetailModalProps {
  execution: ExecutionWithDetails;
  onClose: () => void;
  onResume?: (executionId: number) => void;
}

export const ExecutionDetailModal: React.FC<ExecutionDetailModalProps> = ({
  execution,
  onClose,
  onResume,
}) => {
  const [procedure, setProcedure] = useState<ProcedureWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStepId, setSelectedStepId] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    const fetchProcedure = async () => {
      if (!execution.idProcedure) return;
      setIsLoading(true);
      try {
        const details = await getProcedureDetails(execution.idProcedure);
        if (isMounted && details) {
          setProcedure(details);
          if (details.steps && details.steps.length > 0) {
            setSelectedStepId(details.steps[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching procedure details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProcedure();
    return () => {
      isMounted = false;
    };
  }, [execution.idProcedure]);

  // Contar correcciones totales
  const totalCorrections = execution.inputs.reduce(
    (acc, inp) => acc + (inp.corrections?.length || 0),
    0
  );

  // Mapear inputs por fieldId para pasarlos al StepDetailView
  const inputsMap = execution.inputs.reduce((acc, input) => {
    acc[input.idField] = input;
    return acc;
  }, {} as Record<number, Input>);

  // Obtener pasos del procedimiento
  const steps: StepWithSections[] = procedure?.steps || [];
  const selectedStep = steps.find((s) => s.id === selectedStepId) || steps[0];
  const stepNumber = steps.findIndex((s) => s.id === selectedStepId) + 1;

  // Pasos completados guardados en localStorage para esta ejecución
  const completedStepIds = (() => {
    const raw = localStorage.getItem(`pm_completed_steps_${execution.id}`);
    if (!raw) return new Set<number>();
    try {
      return new Set<number>(JSON.parse(raw) as number[]);
    } catch {
      return new Set<number>();
    }
  })();

  // Req 2: Si el estado es PAUSED o CANCELLED, omitir: líder, fecha último envío, fecha última evaluación
  const isPausedOrCancelled = execution.state === 'PAUSED' || execution.state === 'CANCELLED';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Superior del Modal */}
        <div className="px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${execution.state === 'PENDING_EVALUATION'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : execution.state === 'HAS_CORRECTIONS'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : execution.state === 'APPROVED_FINISHED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : execution.state === 'CANCELLED'
                      ? 'bg-gray-100 text-gray-700 border border-gray-200'
                      : 'bg-blue-100 text-blue-800'
                }`}
            >
              {EXECUTION_STATE_LABELS[execution.state] || execution.state}
            </span>
            <div className="h-4 w-px bg-gray-200" />
            <h2 className="text-base font-bold text-gray-900 truncate">
              Detalle de Ejecución #{execution.id}
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

        {/* Sección Superior de Metadatos de la Ejecución */}
        <div className="bg-gray-50/80 border-b border-gray-200 px-6 py-3 shrink-0">
          <div
            className={`grid gap-3 text-xs ${isPausedOrCancelled
              ? 'grid-cols-2 sm:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
              }`}
          >
            {/* 1. Fecha Inicio (Siempre visible) */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" /> Fecha Inicio
              </span>
              <p className="font-semibold text-gray-900 mt-0.5">
                {new Date(execution.startedAt).toLocaleDateString()}
              </p>
            </div>

            {/* 2. Nombre Líder (Omitir si está pausado o cancelado) */}
            {!isPausedOrCancelled && (
              <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-gray-400" /> Líder
                </span>
                <p
                  className="font-semibold text-gray-900 mt-0.5 truncate"
                  title={execution.leaderName || execution.evaluatorName || 'No asignado'}
                >
                  {execution.leaderName || execution.evaluatorName || 'No asignado'}
                </p>
              </div>
            )}

            {/* 3. Última Fecha Envío (Omitir si está pausado o cancelado) */}
            {!isPausedOrCancelled && (
              <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" /> Último Envío
                </span>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {execution.lastSubmittedAt
                    ? new Date(execution.lastSubmittedAt).toLocaleDateString()
                    : 'Sin envíos'}
                </p>
              </div>
            )}

            {/* 4. Fecha Última Evaluación (Omitir si está pausado o cancelado) */}
            {!isPausedOrCancelled && (
              <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" /> Últ. Evaluación
                </span>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {execution.lastEvaluatedAt
                    ? new Date(execution.lastEvaluatedAt).toLocaleDateString()
                    : 'Pendiente'}
                </p>
              </div>
            )}

            {/* 5. Cantidad Inputs y Correcciones (Siempre visible) */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs flex flex-col justify-center">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-blue-500" /> Inputs:
                </span>
                <span className="font-bold text-gray-900">{execution.inputs.length}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-gray-100">
                <span className="text-gray-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-500" /> Correcciones:
                </span>
                <span className={`font-bold ${totalCorrections > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                  {totalCorrections}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cuerpo Principal */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {isLoading ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              Cargando detalle de pasos y ejecución...
            </div>
          ) : !selectedStep ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              No hay pasos disponibles en este procedimiento.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Barra lateral de Navegación de Pasos y Metadatos */}
              <div className="w-full md:w-64 shrink-0 space-y-5">
                {/* Navegación de Pasos */}
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                    Pasos del Procedimiento
                  </label>
                  <StepNavigation
                    steps={steps}
                    selectedStepId={selectedStepId}
                    onSelectStep={setSelectedStepId}
                    canReorder={false}
                    completedStepIds={completedStepIds}
                    executionState={execution.state}
                    inputs={execution.inputs}
                    allCorrectionsCount={totalCorrections}
                  />
                </div>

                {/* Metadatos adicionales abajo de navegación como en Create and Execute View */}
                {/* 1. Desarrollador */}
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                    Desarrollador
                  </label>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 bg-white p-2 rounded-lg border border-gray-200/80">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{execution.developerName}</span>
                  </div>
                </div>

                {/* 2. Proyecto */}
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                    Proyecto Asignado
                  </label>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white p-2 rounded-lg border border-gray-200/80">
                    <FolderKanban className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{procedure?.projectName || `Proyecto #${execution.idProject}`}</span>
                  </div>
                </div>

                {/* 3. Nombre del Procedimiento */}
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                    Nombre
                  </label>
                  <p className="text-xs font-semibold text-gray-800 leading-snug bg-white p-2 rounded-lg border border-gray-200/80">
                    {procedure?.name || execution.procedureName}
                  </p>
                </div>

                {/* 4. Descripción del Procedimiento */}
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                    Descripción
                  </label>
                  <p className="text-xs text-gray-600 leading-snug bg-white p-2 rounded-lg border border-gray-200/80">
                    {procedure?.description || 'Sin descripción.'}
                  </p>
                </div>
              </div>

              {/* Vista de Detalle del Paso (Sólo lectura) */}
              <div className="flex-1 w-full min-w-0">
                <StepDetailView
                  step={selectedStep}
                  stepNumber={stepNumber}
                  totalSteps={steps.length}
                  inputsMap={inputsMap}
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
            Vista de sólo lectura del procedimiento y sus resultados registrados.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              Cerrar
            </button>

            {execution.state === 'PAUSED' && onResume && (
              <button
                type="button"
                onClick={() => onResume(execution.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <PlaySquare className="w-3.5 h-3.5" /> Reanudar Ejecución
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
