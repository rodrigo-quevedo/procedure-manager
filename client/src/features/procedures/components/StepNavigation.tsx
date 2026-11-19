import React, { useState } from 'react';
import type { Step } from '@shared/types';

interface StepNavigationProps {
  steps: Step[];
  selectedStepId: number;
  onSelectStep: (stepId: number) => void;
  onReorderSteps?: (reordered: Step[]) => void;
  canReorder?: boolean;
  completedStepIds?: Set<number>;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  selectedStepId,
  onSelectStep,
  onReorderSteps,
  canReorder = true,
  completedStepIds = new Set(),
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
            const isDone = completedStepIds.has(step.id);
            return (
              <button
                key={step.id}
                type="button"
                draggable={canReorder}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => onSelectStep(step.id)}
                title={`${step.name} (Paso ${idx + 1})${isDone ? ' — Finalizado' : ''}`}
                className={`relative w-7 h-8 rounded-sm flex items-center justify-center font-bold text-sm transition-all shadow-xs cursor-pointer ${
                  isDone
                    ? isSelected
                      ? 'bg-emerald-600 text-white scale-105'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105'
                    : isSelected
                      ? 'bg-red-600 text-white scale-105'
                      : 'bg-red-700 text-white hover:bg-red-600 hover:scale-105 opacity-90 hover:opacity-100'
                } ${draggedIndex === idx ? 'opacity-40 border-2 border-dashed border-red-300' : ''}`}
              >
                {isDone ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
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
