import React, { useState } from 'react';
import type { Step, Section, Field, ExecutionState, Input } from '@shared/types';
import type { InputWithCorrections } from '@/features/procedure_executions/types';
import { getStepVisualStatus, StepVisualStatus } from '../utils/stepStatus';

interface StepNavigationProps {
  steps: Array<Step & { sections?: Array<Section & { fields: Field[] }> }>;
  selectedStepId: number;
  onSelectStep: (stepId: number) => void;
  onReorderSteps?: (reordered: Step[]) => void;
  canReorder?: boolean;
  completedStepIds?: Set<number>;
  executionState?: ExecutionState | null;
  inputs?: Array<Input | InputWithCorrections>;
  allCorrectionsCount?: number;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  selectedStepId,
  onSelectStep,
  onReorderSteps,
  canReorder = true,
  completedStepIds = new Set(),
  executionState,
  inputs = [],
  allCorrectionsCount = 0,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!canReorder) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!canReorder || draggedIndex === null || draggedIndex === index) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (!canReorder || draggedIndex === null || !onReorderSteps) return;
    e.preventDefault();

    const updated = [...steps];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    // Reassign order
    const normalized = updated.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setDraggedIndex(null);
    onReorderSteps(normalized);
  };

  // Helper para resolver estilos según StepVisualStatus
  const getButtonStyles = (status: StepVisualStatus, isSelected: boolean) => {
    switch (status) {
      case 'COMPLETED_GREEN':
        return isSelected
          ? 'bg-emerald-600 text-white scale-105 shadow-md ring-2 ring-emerald-400'
          : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105';

      case 'CORRECTION_RED':
        return isSelected
          ? 'bg-rose-600 text-white scale-105 shadow-md ring-2 ring-rose-400'
          : 'bg-rose-500 text-white hover:bg-rose-600 hover:scale-105';

      case 'NORMAL_RED_BORDER':
        return isSelected
          ? 'bg-white text-rose-700 border border-red-500 scale-105 shadow-md ring-2 ring-red-400 font-extrabold'
          : 'bg-white text-gray-800 border border-red-400 hover:bg-red-50/50 hover:scale-105';

      case 'NORMAL_INCOMPLETE':
      default:
        return isSelected
          ? 'bg-red-600 text-white scale-105 shadow-md ring-2 ring-red-400'
          : 'bg-red-700 text-white hover:bg-red-600 hover:scale-105 opacity-90 hover:opacity-100';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold text-red-600 tracking-wider">
          Navegación
        </label>
        {canReorder && steps.length > 1 && (
          <span className="text-[10px] text-gray-400">Arrastra para reordenar</span>
        )}
      </div>

      <div className="p-3 bg-white border border-gray-200 rounded-sm shadow-inner">
        <div className="flex flex-wrap gap-2.5 items-center">
          {steps.map((step, idx) => {
            const isSelected = selectedStepId === step.id;
            const status = getStepVisualStatus({
              step,
              executionState,
              completedStepIds,
              inputs,
              allCorrectionsCount,
            });

            const isDone = status === 'COMPLETED_GREEN';
            const hasCorrection = status === 'CORRECTION_RED';

            return (
              <button
                key={step.id}
                type="button"
                draggable={canReorder}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => onSelectStep(step.id)}
                title={`${step.name} (Paso ${idx + 1})${
                  isDone
                    ? ' — Finalizado / Aprobado'
                    : hasCorrection
                      ? ' — Con Corrección Pendiente'
                      : ''
                }`}
                className={`relative w-7 h-8 rounded-sm flex items-center justify-center font-bold text-sm transition-all shadow-xs cursor-pointer ${getButtonStyles(
                  status,
                  isSelected
                )} ${
                  draggedIndex === idx ? 'opacity-40 border-2 border-dashed border-red-300' : ''
                }`}
              >
                {idx + 1}

                {/* Badge de check verde para pasos completados */}
                {isDone && (
                  <span className="absolute -top-1 -right-1 bg-white text-emerald-600 rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-2.5 w-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}

                {/* Badge de advertencia para paso con corrección */}
                {hasCorrection && (
                  <span className="absolute -top-1 -right-1 bg-white text-rose-600 rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs font-black text-[9px] leading-none">
                    !
                  </span>
                )}
              </button>
            );
          })}

          {steps.length === 0 && (
            <span className="text-xs text-gray-400 italic">Sin pasos</span>
          )}
        </div>
      </div>
    </div>
  );
};
