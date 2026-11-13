import React, { useState, useEffect } from 'react';
import type { User } from '@/features/auth/types';
import type { ClientProject } from '@/features/projects/types';
import type {
  Step,
  Section,
  Field,
  FieldType,
  Input,
  Procedure,
  Execution,
} from '@shared/types';
import { StepNavigation } from './StepNavigation';
import { StepDetailView } from './StepDetailView';
import { saveProcedureHierarchy, updateProcedureState } from '../api/proceduresApi';
import { createExecution, saveExecutionInput, updateExecutionState } from '@/features/procedure_executions/api/executionsApi';

interface CreationAndExecutionViewProps {
  currentUser: User;
  projects: ClientProject[];
  initialProcedure?: Procedure | null;
  initialExecution?: Execution | null;
  initialSteps?: Array<Step & { sections: Array<Section & { fields: Field[] }> }>;
  initialInputs?: Input[];
  mode?: 'CREATION_AND_EXECUTION' | 'EXECUTE_EXISTING';
  onBack?: () => void;
  onSuccessFeedback?: (message: string) => void;
}

export const CreationAndExecutionView: React.FC<CreationAndExecutionViewProps> = ({
  currentUser,
  projects,
  initialProcedure,
  initialExecution,
  initialSteps,
  initialInputs = [],
  mode = 'CREATION_AND_EXECUTION',
  onBack,
  onSuccessFeedback,
}) => {
  // Project selection
  const [selectedProjectId, setSelectedProjectId] = useState<number>(() => {
    if (initialProcedure?.idProject) return initialProcedure.idProject;
    if (projects.length > 0) return Number(projects[0].id) || 1;
    return 1;
  });

  // Procedure metadata
  const [procedureName, setProcedureName] = useState(
    initialProcedure?.name || 'Despliegue de Microservicio Auth'
  );
  const [procedureDescription, setProcedureDescription] = useState(
    initialProcedure?.description ||
      'Procedimiento para desplegar en staging las dependencias del módulo Auth'
  );
  const [isEditingProcName, setIsEditingProcName] = useState(false);
  const [isEditingProcDesc, setIsEditingProcDesc] = useState(false);

  // Steps and hierarchy
  const [steps, setSteps] = useState<Array<Step & { sections: Array<Section & { fields: Field[] }> }>>(() => {
    if (initialSteps && initialSteps.length > 0) return initialSteps;
    // Default initial step
    const initialStepId = 1;
    const initialSectionId = 11;
    const initialFieldId = 111;
    return [
      {
        id: initialStepId,
        idProcedure: 0,
        name: 'Configuración y Verificación Previa',
        description: 'Verificar el entorno local y preparar variables de entorno',
        order: 1,
        sections: [
          {
            id: initialSectionId,
            idStep: initialStepId,
            name: 'Variables de Entorno',
            description: 'Credenciales y secretos de configuración',
            fields: [
              {
                id: initialFieldId,
                idSection: initialSectionId,
                fieldType: 'TEXT',
                content: 'Especificar clave JWT: Ingresar la clave de firma token en la consola.',
              },
            ],
          },
        ],
      },
    ];
  });

  const [selectedStepId, setSelectedStepId] = useState<number>(() => {
    if (initialSteps && initialSteps.length > 0) return initialSteps[0].id;
    return 1;
  });

  // Execution & Inputs
  const [execution, setExecution] = useState<Execution | null>(initialExecution || null);
  const [inputsMap, setInputsMap] = useState<Record<number, Input>>(() => {
    const map: Record<number, Input> = {};
    initialInputs.forEach((inp) => {
      map[inp.idField] = inp;
    });
    return map;
  });

  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Ensure an active execution instance exists
  useEffect(() => {
    if (!execution) {
      const devId = Number(currentUser.id) || 1;
      createExecution(initialProcedure?.id || 0, selectedProjectId, devId).then((exec) => {
        setExecution(exec);
      });
    }
  }, [currentUser.id, execution, initialProcedure?.id, selectedProjectId]);

  // Handle Step selection
  const currentStep = steps.find((s) => s.id === selectedStepId) || steps[0];
  const currentStepIndex = steps.findIndex((s) => s.id === (currentStep?.id || 0));

  // Step operations
  const handleCreateStep = () => {
    const newStepId = Date.now();
    const newOrder = steps.length + 1;
    const newStep: Step & { sections: Array<Section & { fields: Field[] }> } = {
      id: newStepId,
      idProcedure: initialProcedure?.id || 0,
      name: `Nuevo Paso ${newOrder}`,
      description: 'Descripción del paso',
      order: newOrder,
      sections: [],
    };

    setSteps((prev) => [...prev, newStep]);
    setSelectedStepId(newStepId);
    setHasSavedProgress(false);
  };

  const handleDeleteStep = (stepId: number) => {
    if (steps.length <= 1) {
      alert('El procedimiento debe tener al menos un paso.');
      return;
    }
    const filtered = steps.filter((s) => s.id !== stepId);
    setSteps(filtered);
    if (selectedStepId === stepId) {
      setSelectedStepId(filtered[0].id);
    }
    setHasSavedProgress(false);
  };

  const handleUpdateStep = (updated: Step) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
    setHasSavedProgress(false);
  };

  const handleReorderSteps = (reordered: Step[]) => {
    const reorderedFull = reordered.map((r) => {
      const existing = steps.find((s) => s.id === r.id);
      return {
        ...existing!,
        order: r.order,
      };
    });
    setSteps(reorderedFull);
    setHasSavedProgress(false);
  };

  // Section operations
  const handleCreateSection = (stepId: number, title: string) => {
    const newSectionId = Date.now();
    const newSection: Section & { fields: Field[] } = {
      id: newSectionId,
      idStep: stepId,
      name: title,
      description: '',
      fields: [],
    };

    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, sections: [...s.sections, newSection] } : s
      )
    );
    setHasSavedProgress(false);
  };

  const handleUpdateSection = (updated: Section) => {
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        sections: s.sections.map((sec) =>
          sec.id === updated.id ? { ...sec, ...updated } : sec
        ),
      }))
    );
    setHasSavedProgress(false);
  };

  // Field operations
  const handleCreateField = (sectionId: number, fieldType: FieldType, content: string) => {
    const newFieldId = Date.now();
    const newField: Field = {
      id: newFieldId,
      idSection: sectionId,
      fieldType,
      content,
    };

    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        sections: s.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, fields: [...sec.fields, newField] } : sec
        ),
      }))
    );
    setHasSavedProgress(false);
  };

  const handleUpdateField = (updated: Field) => {
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        sections: s.sections.map((sec) => ({
          ...sec,
          fields: sec.fields.map((f) => (f.id === updated.id ? updated : f)),
        })),
      }))
    );
    setHasSavedProgress(false);
  };

  // Execution Input operation
  const handleSaveInput = async (fieldId: number, fieldType: FieldType, content: string) => {
    if (!execution) return;
    const input = await saveExecutionInput(execution.id, fieldId, fieldType, content);
    setInputsMap((prev) => ({
      ...prev,
      [fieldId]: input,
    }));
  };

  // Save progress (HU-007 CA 10 / HU-009 CA 4)
  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      const devId = Number(currentUser.id) || 1;
      const savedProc = await saveProcedureHierarchy({
        procedure: {
          id: initialProcedure?.id,
          idProject: selectedProjectId,
          name: procedureName,
          description: procedureDescription,
          state: initialProcedure?.state || 'DRAFT',
        },
        steps,
        idCreator: devId,
      });

      if (execution) {
        execution.idProcedure = savedProc.id;
        execution.idProject = selectedProjectId;
        await updateExecutionState(execution.id, 'ACTIVE');
      }

      setHasSavedProgress(true);
      if (onSuccessFeedback) {
        onSuccessFeedback('Progreso del procedimiento y ejecución guardado correctamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Send for evaluation (HU-007 CA 11 / HU-009 CA 4)
  const handleSendForEvaluation = async () => {
    if (!hasSavedProgress) return;
    setIsSending(true);
    try {
      if (execution) {
        await updateExecutionState(execution.id, 'PENDING_EVALUATION');
      }
      if (initialProcedure?.id) {
        await updateProcedureState(initialProcedure.id, 'PENDING_APPROVAL');
      }
      if (onSuccessFeedback) {
        onSuccessFeedback('Procedimiento y ejecución enviados para evaluación por un Líder.');
      }
      if (onBack) onBack();
    } finally {
      setIsSending(false);
    }
  };

  // Pause execution (HU-011 CA 3)
  const handlePause = async () => {
    if (!execution) return;
    await handleSaveProgress();
    await updateExecutionState(execution.id, 'PAUSED');
    if (onSuccessFeedback) {
      onSuccessFeedback('Ejecución pausada y progreso guardado.');
    }
    if (onBack) onBack();
  };

  // Cancel execution (HU-011 CA 5)
  const handleCancel = async () => {
    const confirmed = window.confirm('¿Está seguro de que desea cancelar esta ejecución? No permitirá nuevas modificaciones.');
    if (!confirmed || !execution) return;
    await updateExecutionState(execution.id, 'CANCELLED');
    if (onSuccessFeedback) {
      onSuccessFeedback('Ejecución cancelada.');
    }
    if (onBack) onBack();
  };

  const isExecutionOnly = mode === 'EXECUTE_EXISTING';

  return (
    <div className="flex h-screen bg-white text-gray-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-200 bg-gray-50 p-4 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-bold text-red-600 tracking-wide bg-red-50 border border-red-200 px-3 py-1 rounded-md shadow-xs">
              {isExecutionOnly ? 'Ejecución de Procedimiento' : 'Nuevo Procedimiento'}
            </span>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-gray-500 hover:text-red-600 cursor-pointer"
              >
                Volver
              </button>
            )}
          </div>

          {/* Navigation Steps */}
          <StepNavigation
            steps={steps}
            selectedStepId={selectedStepId}
            onSelectStep={setSelectedStepId}
            onReorderSteps={handleReorderSteps}
            canReorder={!isExecutionOnly}
          />

          {/* Project Selection (HU-007 CA 1) */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              Proyecto Asignado
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              disabled={isExecutionOnly}
              className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-xs cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={Number(proj.id)}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Procedure Name */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              NOMBRE
            </label>
            {isEditingProcName && !isExecutionOnly ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  className="w-full text-xs border border-red-300 rounded p-1 outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingProcName(false)}
                  className="text-[11px] text-red-600 font-semibold"
                >
                  Listo
                </button>
              </div>
            ) : (
              <div
                className="inline-flex items-center gap-1.5 max-w-full cursor-pointer group"
                onDoubleClick={() => !isExecutionOnly && setIsEditingProcName(true)}
              >
                <span className="text-xs font-semibold text-gray-800 leading-snug">
                  {procedureName}
                </span>
                {!isExecutionOnly && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProcName(true)}
                    title="Editar nombre"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded p-0.5 transition-all shrink-0"
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

          {/* Procedure Description */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              DESCRIPCIÓN
            </label>
            {isEditingProcDesc && !isExecutionOnly ? (
              <div className="space-y-1">
                <textarea
                  value={procedureDescription}
                  onChange={(e) => setProcedureDescription(e.target.value)}
                  rows={2}
                  className="w-full text-xs border border-red-300 rounded p-1 outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingProcDesc(false)}
                  className="text-[11px] text-red-600 font-semibold"
                >
                  Listo
                </button>
              </div>
            ) : (
              <div
                className="inline-flex items-start gap-1.5 max-w-full cursor-pointer group"
                onDoubleClick={() => !isExecutionOnly && setIsEditingProcDesc(true)}
              >
                <p className="text-xs text-gray-600 leading-snug">{procedureDescription}</p>
                {!isExecutionOnly && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProcDesc(true)}
                    title="Editar descripción"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded p-0.5 transition-all shrink-0 mt-0.5"
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

        {/* Action Buttons: Guardar & Enviar (HU-007 CA 10 & 11 / HU-009 CA 4) */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSaveProgress}
            disabled={isSaving}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Procedimiento'}
          </button>
          <button
            type="button"
            onClick={handleSendForEvaluation}
            disabled={!hasSavedProgress || isSending}
            title={!hasSavedProgress ? 'Primero guarde el procedimiento para habilitar el envío' : ''}
            className={`w-full py-1.5 rounded text-xs transition-colors cursor-pointer ${
              hasSavedProgress
                ? 'bg-slate-900 hover:bg-black text-white font-semibold shadow-xs'
                : 'border border-gray-200 hover:bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </aside>

      {/* Main Content: Step Detail */}
      <main className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
        {currentStep ? (
          <StepDetailView
            step={currentStep}
            stepNumber={currentStepIndex + 1}
            totalSteps={steps.length}
            inputsMap={inputsMap}
            isExecutable={true}
            canEditDefinition={!isExecutionOnly}
            onUpdateStep={handleUpdateStep}
            onDeleteStep={handleDeleteStep}
            onCreateStep={handleCreateStep}
            onPauseExecution={handlePause}
            onCancelExecution={handleCancel}
            onCreateSection={handleCreateSection}
            onUpdateSection={handleUpdateSection}
            onCreateField={handleCreateField}
            onUpdateField={handleUpdateField}
            onSaveInput={handleSaveInput}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No hay pasos creados.</p>
            {!isExecutionOnly && (
              <button
                type="button"
                onClick={handleCreateStep}
                className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg"
              >
                Crear primer paso
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
