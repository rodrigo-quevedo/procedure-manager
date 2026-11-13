import React, { useState } from 'react';
import type { Step, Section, Field, FieldType, Input } from '@shared/types';
import { SectionBlock } from './SectionBlock';

interface StepDetailViewProps {
  step: Step & { sections: Array<Section & { fields: Field[] }> };
  stepNumber: number;
  totalSteps: number;
  inputsMap?: Record<number, Input>;
  isExecutable?: boolean;
  canEditDefinition?: boolean;
  onUpdateStep?: (updated: Step) => void;
  onDeleteStep?: (stepId: number) => void;
  onCreateStep?: () => void;
  onPauseExecution?: () => void;
  onCancelExecution?: () => void;
  onCreateSection?: (stepId: number, title: string) => void;
  onUpdateSection?: (section: Section) => void;
  onCreateField?: (sectionId: number, fieldType: FieldType, content: string) => void;
  onUpdateField?: (field: Field) => void;
  onSaveInput?: (fieldId: number, fieldType: FieldType, content: string) => void;
}

export const StepDetailView: React.FC<StepDetailViewProps> = ({
  step,
  stepNumber,
  totalSteps,
  inputsMap = {},
  isExecutable = true,
  canEditDefinition = true,
  onUpdateStep,
  onDeleteStep,
  onCreateStep,
  onPauseExecution,
  onCancelExecution,
  onCreateSection,
  onUpdateSection,
  onCreateField,
  onUpdateField,
  onSaveInput,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [stepName, setStepName] = useState(step.name);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [stepDesc, setStepDesc] = useState(step.description);

  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const handleSaveTitle = () => {
    if (onUpdateStep) {
      onUpdateStep({ ...step, name: stepName });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = () => {
    if (onUpdateStep) {
      onUpdateStep({ ...step, description: stepDesc });
    }
    setIsEditingDesc(false);
  };

  const handleCreateSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    if (onCreateSection) {
      onCreateSection(step.id, newSectionTitle.trim());
    }
    setNewSectionTitle('');
    setIsCreatingSection(false);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-gray-100 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold font-mono border border-red-200 shadow-xs">
              Paso {stepNumber} de {totalSteps}
            </span>

            {isExecutable && onPauseExecution && (
              <button
                type="button"
                onClick={onPauseExecution}
                title="Pausar procedimiento"
                className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 hover:text-amber-800 px-2.5 py-1 rounded-md text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Pausar
              </button>
            )}

            {isExecutable && onCancelExecution && (
              <button
                type="button"
                onClick={onCancelExecution}
                title="Cancelar procedimiento"
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 border border-gray-300 hover:border-red-300 text-gray-600 hover:text-red-600 px-2.5 py-1 rounded-md text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancelar
              </button>
            )}
          </div>

          {canEditDefinition && (
            <div className="flex items-center gap-2.5">
              {onCreateStep && (
                <button
                  type="button"
                  onClick={onCreateStep}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xs hover:shadow-sm transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <span className="text-sm leading-none font-black">+</span> Crear Paso
                </button>
              )}
              {onDeleteStep && (
                <button
                  type="button"
                  onClick={() => onDeleteStep(step.id)}
                  className="text-xs font-semibold bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 px-3 py-1.5 rounded-lg transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>🗑</span> Eliminar Paso
                </button>
              )}
            </div>
          )}
        </div>

        {/* Step Title */}
        <div className="mb-3">
          <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            Título
          </label>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                className="text-xl font-bold text-gray-900 border border-red-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-red-500 flex-1"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="px-3 py-1 text-gray-500 text-xs"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div
              className="inline-flex items-center gap-2 max-w-full cursor-pointer group"
              onDoubleClick={() => {
                if (canEditDefinition) setIsEditingTitle(true);
              }}
            >
              <span className="text-2xl font-bold text-gray-900 leading-none">{step.name}</span>
              {canEditDefinition && (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  title="Editar título"
                  className="text-gray-400 group-hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        <hr className="border-t border-gray-200 my-3" />

        {/* Step Description */}
        <div>
          <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            Descripción
          </label>
          {isEditingDesc ? (
            <div className="space-y-2">
              <textarea
                value={stepDesc}
                onChange={(e) => setStepDesc(e.target.value)}
                rows={2}
                className="w-full text-xs text-gray-700 border border-red-300 rounded p-2 outline-none focus:ring-1 focus:ring-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingDesc(false)}
                  className="px-2.5 py-1 text-gray-500 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveDesc}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div
              className="inline-flex items-start gap-2 max-w-full cursor-pointer group"
              onDoubleClick={() => {
                if (canEditDefinition) setIsEditingDesc(true);
              }}
            >
              <p className="text-sm text-gray-600">{step.description || 'Sin descripción'}</p>
              {canEditDefinition && (
                <button
                  type="button"
                  onClick={() => setIsEditingDesc(true)}
                  title="Editar descripción"
                  className="text-gray-400 group-hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors mt-0.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sections in this Step */}
      <div className="space-y-6">
        {step.sections.map((section, sIdx) => (
          <div key={section.id} className="space-y-1">
            <span className="inline-block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              SECCIÓN {sIdx + 1}
            </span>
            <SectionBlock
              section={section}
              inputsMap={inputsMap}
              isExecutable={isExecutable}
              canEditDefinition={canEditDefinition}
              onUpdateSection={onUpdateSection}
              onCreateField={onCreateField}
              onUpdateField={onUpdateField}
              onSaveInput={onSaveInput}
            />
          </div>
        ))}

        {step.sections.length === 0 && (
          <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Este paso aún no tiene secciones.</p>
          </div>
        )}
      </div>

      {/* Inline Create Section Form */}
      {isCreatingSection && (
        <form onSubmit={handleCreateSectionSubmit} className="bg-white p-4 rounded-lg border border-red-200 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-red-600 uppercase">Título de la Sección</label>
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Ej. Configuración de entorno, Despliegue de artefactos..."
            className="w-full text-xs border border-gray-300 rounded p-2 outline-none focus:border-red-500"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingSection(false)}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded shadow-xs"
            >
              Crear Sección
            </button>
          </div>
        </form>
      )}

      {/* Horizontal Rule + Button "+ Crear Sección" */}
      {canEditDefinition && !isCreatingSection && (
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-red-300"></div>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatingSection(true)}
            className="relative z-10 inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-red-400 text-gray-700 hover:text-red-600 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-red-600 font-bold">+</span> Crear Sección
          </button>
        </div>
      )}
    </div>
  );
};
