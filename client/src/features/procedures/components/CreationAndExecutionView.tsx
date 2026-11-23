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
  ExecutionState,
} from '@shared/types';
import { StepNavigation } from './StepNavigation';
import { StepDetailView } from './StepDetailView';
import { saveProcedureHierarchy, updateProcedureState } from '../api/proceduresApi';
import {
  createExecution,
  saveExecutionInput,
  updateExecutionState,
  getCompletedStepIds,
  toggleStepCompleted,
} from '@/features/procedure_executions/api/executionsApi';
import { Tags } from 'lucide-react';

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
    initialProcedure?.name || ''
  );
  const [procedureDescription, setProcedureDescription] = useState(
    initialProcedure?.description || ''
  );
  const [isEditingProcName, setIsEditingProcName] = useState(false);
  const [isEditingProcDesc, setIsEditingProcDesc] = useState(false);

  // Steps and hierarchy
  const [steps, setSteps] = useState<Array<Step & { sections: Array<Section & { fields: Field[] }> }>>(() => {
    if (initialSteps && initialSteps.length > 0) return initialSteps;
    // Al crear nuevo procedimiento: solo un paso inicial vacío, sin secciones ni campos precargados
    return [
      {
        id: 1,
        idProcedure: 0,
        name: '',
        description: '',
        order: 1,
        sections: [],
      },
    ];
  });

  const [selectedStepId, setSelectedStepId] = useState<number>(() => {
    if (initialSteps && initialSteps.length > 0) return initialSteps[0].id;
    return 1;
  });

  const [procedureId, setProcedureId] = useState<number>(initialProcedure?.id || 0);

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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);

  // ── Pasos completados: sincronizado con base de datos por ejecución ─────────
  const [completedStepIds, setCompletedStepIds] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    (initialSteps || []).forEach((s) => {
      if (s.isCompleted) initial.add(s.id);
    });
    return initial;
  });

  useEffect(() => {
    if (execution?.id) {
      getCompletedStepIds(execution.id)
        .then((ids) => {
          setCompletedStepIds((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => next.add(id));
            return next;
          });
        })
        .catch(console.error);
    }
  }, [execution?.id]);

  const handleToggleStepCompleted = async (stepId: number) => {
    const wasCompleted = completedStepIds.has(stepId);
    const nextCompleted = !wasCompleted;

    setCompletedStepIds((prev) => {
      const next = new Set(prev);
      if (wasCompleted) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });

    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, isCompleted: nextCompleted } : s))
    );

    const execId = execution?.id;
    // Si la ejecución y el paso ya están en la base de datos (id real < 1e11), persistir de inmediato
    if (execId && stepId < 1e11) {
      try {
        await toggleStepCompleted(execId, stepId);
      } catch (err) {
        console.error('Error actualizando paso completado en base de datos:', err);
      }
    }
  };

  // ── Req 1: Derivar el modo de vista desde procedure.state ──────────────────
  // Si el procedimiento está en DRAFT (en creación) → modo creación+ejecución.
  // Para cualquier otro estado (DEVIATION, PENDING_APPROVAL, APPROVED) → solo ejecución.
  const procedureState = initialProcedure?.state ?? 'DRAFT';
  const isCreationMode = mode === 'CREATION_AND_EXECUTION' && procedureState === 'DRAFT';
  const isExecutionOnly = !isCreationMode;

  // ── Req 4: Qué acciones están disponibles según el estado de la ejecución ──
  // canPause:   ACTIVE | PAUSED | HAS_CORRECTIONS
  // canGoBack:  PENDING_EVALUATION | APPROVED_FINISHED | CANCELLED
  const executionState: ExecutionState | null = execution?.state ?? null;
  const canPause =
    executionState === 'ACTIVE' ||
    executionState === 'PAUSED' ||
    executionState === 'HAS_CORRECTIONS';
  const canGoBack =
    executionState === 'PENDING_EVALUATION' ||
    executionState === 'APPROVED_FINISHED' ||
    executionState === 'CANCELLED';

  // "hasUnsavedChanges" para el modal de Volver: hay cambios sin guardar si no se ha guardado progreso
  const hasUnsavedChanges = !hasSavedProgress;

  // Ensure an active execution instance exists if procedure is already persisted
  useEffect(() => {
    if (!execution && procedureId > 0) {
      const devId = Number(currentUser.id) || 1;
      createExecution(procedureId, selectedProjectId, devId)
        .then((exec) => {
          setExecution(exec);
        })
        .catch(console.error);
    }
  }, [currentUser.id, execution, procedureId, selectedProjectId]);

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
  const handleCreateSection = (stepId: number, title: string, description: string = '') => {
    const newSectionId = Date.now();
    const newSection: Section & { fields: Field[] } = {
      id: newSectionId,
      idStep: stepId,
      name: title,
      description,
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

  const handleDeleteSection = (sectionId: number) => {
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        sections: s.sections.filter((sec) => sec.id !== sectionId),
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

  const handleDeleteField = (fieldId: number) => {
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        sections: s.sections.map((sec) => ({
          ...sec,
          fields: sec.fields.filter((f) => f.id !== fieldId),
        })),
      }))
    );
    setInputsMap((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
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
    setHasSavedProgress(false);
  };

  // Save progress (HU-007 CA 10 / HU-009 CA 4)
  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      const devId = Number(currentUser.id) || 1;
      const nameToSave = procedureName.trim() || 'Nuevo Procedimiento';
      const procIdToSave = procedureId > 0 ? procedureId : undefined;
      const savedProc = await saveProcedureHierarchy({
        procedure: {
          id: procIdToSave,
          idProject: selectedProjectId,
          name: nameToSave,
          description: procedureDescription || '',
          state: initialProcedure?.state || 'DRAFT',
          tags: initialProcedure?.tags,
        },
        steps: steps.map((s, idx) => ({
          ...s,
          name: s.name || `Paso ${idx + 1}`,
          description: s.description || '',
          isCompleted: completedStepIds.has(s.id) || s.isCompleted,
        })),
        idCreator: devId,
      });

      if (!procedureName.trim()) {
        setProcedureName(nameToSave);
      }

      setProcedureId(savedProc.id);
      if (savedProc.steps && savedProc.steps.length > 0) {
        setSteps(savedProc.steps);
        const newCompleted = new Set<number>();
        savedProc.steps.forEach((st) => {
          if (st.isCompleted) newCompleted.add(st.id);
        });
        setCompletedStepIds(newCompleted);
      }

      let currentExec = execution;
      if (!currentExec || !currentExec.id) {
        currentExec = await createExecution(savedProc.id, selectedProjectId, devId);
        setExecution(currentExec);
      } else {
        currentExec.idProcedure = savedProc.id;
        currentExec.idProject = selectedProjectId;
        // ── Req 2 / Req 3: No sobreescribir el estado de la ejecución al guardar.
        // Solo marcar como ACTIVE si está en modo creación y aún no tiene estado definitivo.
        if (currentExec.state === 'ACTIVE') {
          await updateExecutionState(currentExec.id, 'ACTIVE');
        }
      }

      setHasSavedProgress(true);
      if (onSuccessFeedback) {
        onSuccessFeedback('Progreso del procedimiento y ejecución guardado correctamente.');
      }
      return { savedProc, currentExec };
    } finally {
      setIsSaving(false);
    }
  };

  // Send for evaluation (HU-007 CA 11 / HU-009 CA 4)
  // Requisito: Si todos los pasos están finalizados y se guarda y envía,
  // el estado de la ejecución en db pasa a "evaluacion pendiente" (PENDING_EVALUATION).
  const handleSendForEvaluation = async () => {
    const allCompleted =
      steps.length > 0 &&
      steps.every((s) => completedStepIds.has(s.id) || s.isCompleted);
    if (!allCompleted) {
      alert('Para enviar a evaluación, todos los pasos deben estar marcados como finalizados.');
      return;
    }

    setIsSending(true);
    try {
      let currentExec = execution;
      let currentProcId = procedureId;
      if (!hasSavedProgress || !currentExec || !currentExec.id) {
        const result = await handleSaveProgress();
        if (result) {
          currentExec = result.currentExec;
          currentProcId = result.savedProc.id;
        }
      }

      if (currentExec && currentExec.id) {
        await updateExecutionState(currentExec.id, 'PENDING_EVALUATION');
        setExecution({ ...currentExec, state: 'PENDING_EVALUATION' });
      }

      if (currentProcId && currentProcId > 0) {
        await updateProcedureState(currentProcId, 'PENDING_APPROVAL');
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
  // Requisito: cuando se guarda el procedimiento creado (si es nuevo), y luego se aprieta en pausa o volver,
  // el estado de la ejecución en la db pasa a pausado.
  const handlePause = async () => {
    try {
      let currentExec = execution;
      if (!hasSavedProgress || !currentExec || !currentExec.id) {
        const result = await handleSaveProgress();
        if (result) currentExec = result.currentExec;
      }

      if (currentExec && currentExec.id) {
        if (currentExec.state !== 'HAS_CORRECTIONS') {
          await updateExecutionState(currentExec.id, 'PAUSED');
          setExecution({ ...currentExec, state: 'PAUSED' });
        }
      }

      if (onSuccessFeedback) {
        onSuccessFeedback(
          currentExec?.state === 'HAS_CORRECTIONS'
            ? 'Progreso guardado. La ejecución sigue en Corrección Pendiente.'
            : 'Ejecución pausada y progreso guardado.'
        );
      }
      if (onBack) onBack();
    } catch (err) {
      console.error('Error al pausar ejecución:', err);
      if (onBack) onBack();
    }
  };

  // Cancel execution (HU-011 CA 5)
  // Requisito: Si se aprieta en cancelar, pasa a cancelado en la DB.
  const handleConfirmCancel = async () => {
    try {
      let currentExec = execution;
      // Si la ejecución no se había creado en DB aún:
      if (!currentExec || !currentExec.id) {
        const devId = Number(currentUser.id) || 1;
        const nameToSave = procedureName.trim() || 'Nuevo Procedimiento (Cancelado)';
        const procIdToSave = procedureId > 0 ? procedureId : undefined;
        const savedProc = await saveProcedureHierarchy({
          procedure: {
            id: procIdToSave,
            idProject: selectedProjectId,
            name: nameToSave,
            description: procedureDescription || '',
            state: initialProcedure?.state || 'DRAFT',
            tags: initialProcedure?.tags,
          },
          steps: steps.map((s, idx) => ({
            ...s,
            name: s.name || `Paso ${idx + 1}`,
            description: s.description || '',
            isCompleted: completedStepIds.has(s.id) || s.isCompleted,
          })),
          idCreator: devId,
        });
        setProcedureId(savedProc.id);
        currentExec = await createExecution(savedProc.id, selectedProjectId, devId);
        setExecution(currentExec);
      }

      if (currentExec?.id) {
        await updateExecutionState(currentExec.id, 'CANCELLED');
        setExecution({ ...currentExec, state: 'CANCELLED' });
      }
    } catch (err) {
      console.error('Error al cancelar ejecución:', err);
    } finally {
      setShowCancelModal(false);
      if (onSuccessFeedback) {
        onSuccessFeedback('Ejecución cancelada.');
      }
      if (onBack) onBack();
    }
  };

  // ── Req 3: Volver con confirmación si hay cambios sin guardar ──────────────
  // Requisito: si luego se aprieta en volver (habiéndose guardado el procedimiento nuevo),
  // el estado de la ejecución en la db pasa a pausado.
  const handleBackRequest = async () => {
    if (hasUnsavedChanges) {
      setShowBackModal(true);
    } else {
      if (
        execution?.id &&
        execution.state !== 'CANCELLED' &&
        execution.state !== 'APPROVED_FINISHED' &&
        execution.state !== 'PENDING_EVALUATION'
      ) {
        await updateExecutionState(execution.id, 'PAUSED');
        setExecution({ ...execution, state: 'PAUSED' });
      }
      if (onBack) onBack();
    }
  };

  const handleBackWithoutSaving = () => {
    setShowBackModal(false);
    if (onBack) onBack();
  };

  const handleBackWithSaving = async () => {
    setShowBackModal(false);
    try {
      const result = await handleSaveProgress();
      const exec = result?.currentExec || execution;
      if (
        exec?.id &&
        exec.state !== 'CANCELLED' &&
        exec.state !== 'APPROVED_FINISHED' &&
        exec.state !== 'PENDING_EVALUATION'
      ) {
        await updateExecutionState(exec.id, 'PAUSED');
        setExecution({ ...exec, state: 'PAUSED' });
      }
    } catch (err) {
      console.error('Error al guardar y volver:', err);
    } finally {
      if (onBack) onBack();
    }
  };

  return (
    <div className="flex h-screen bg-white text-gray-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-200 bg-gray-50 p-4 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            {/* ── Req 1: Etiqueta diferenciada según procedure.state ── */}
            <span className="text-sm font-bold text-red-600 tracking-wide bg-red-50 border border-red-200 px-3 py-1 rounded-md shadow-xs">
              {isCreationMode ? 'Nuevo Procedimiento' : 'Ejecución de Procedimiento'}
            </span>
            {/* ── Req 4: "Volver" en header solo para modo creación o estados canGoBack ── */}
            {onBack && (isCreationMode || canGoBack) && (
              <button
                type="button"
                onClick={handleBackRequest}
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
            completedStepIds={completedStepIds}
            executionState={executionState}
            inputs={Object.values(inputsMap)}
            allCorrectionsCount={0}
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

          {/* Categorías / Tags */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              Categorías
            </label>
            <div className="flex flex-wrap gap-1 bg-white p-2 rounded-lg border border-gray-200">
              {initialProcedure?.tags && initialProcedure.tags.length > 0 ? (
                initialProcedure.tags.map((tag) => (
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
                <span className={`text-xs font-semibold leading-snug ${!procedureName ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                  {procedureName || 'Sin nombre (clic para editar)'}
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
                <p className={`text-xs leading-snug ${!procedureDescription ? 'text-gray-400 italic' : 'text-gray-600'}`}>
                  {procedureDescription || 'Sin descripción (clic para editar)'}
                </p>
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

        {/* Action Buttons según modo y estado de ejecución */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          {/* ── Botones Guardar y Enviar: visibles en modo creación o cuando se puede pausar ── */}
          {(isCreationMode || canPause) && (
            <>
              {/* Botón Guardar (arriba) */}
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={isSaving || hasSavedProgress}
                className={`w-full font-medium py-2 rounded text-sm transition-colors shadow-xs ${
                  !hasSavedProgress && !isSaving
                    ? 'bg-red-600 hover:bg-red-700 text-white border border-red-600 cursor-pointer'
                    : 'bg-white text-red-600 border border-red-300 opacity-60 cursor-not-allowed hover:bg-white'
                }`}
              >
                {isSaving ? 'Guardando...' : hasSavedProgress ? 'Guardado ✓' : 'Guardar'}
              </button>

              {/* Botón Enviar (abajo) */}
              <button
                type="button"
                onClick={handleSendForEvaluation}
                disabled={isSending}
                className={`w-full py-2 rounded text-sm font-medium transition-colors shadow-xs ${
                  !isSending
                    ? 'bg-red-600 hover:bg-red-700 text-white border border-red-600 cursor-pointer'
                    : 'bg-white text-red-600 border border-red-300 opacity-60 cursor-not-allowed hover:bg-white'
                }`}
              >
                {isSending
                  ? 'Enviando...'
                  : !hasSavedProgress
                  ? 'Guardar y Enviar'
                  : 'Enviar a Evaluación'}
              </button>
            </>
          )}

          {/* ── Botón Volver: visible cuando canGoBack ── */}
          {canGoBack && (
            <button
              type="button"
              onClick={handleBackRequest}
              className="w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
          )}
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
            isCompleted={completedStepIds.has(currentStep.id)}
            onToggleCompleted={() => handleToggleStepCompleted(currentStep.id)}
            onUpdateStep={handleUpdateStep}
            onDeleteStep={handleDeleteStep}
            onCreateStep={handleCreateStep}
            onPauseExecution={handlePause}
            onCancelExecution={() => setShowCancelModal(true)}
            onCreateSection={handleCreateSection}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            onCreateField={handleCreateField}
            onUpdateField={handleUpdateField}
            onDeleteField={handleDeleteField}
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

      {/* Modal Confirmación de Cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-gray-900">Confirmar Cancelación</h3>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              ¿Está seguro de que desea cancelar esta ejecución en curso?
              Esta acción no permitirá nuevas modificaciones y quedará registrada en el historial como cancelada.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Continuar Ejecutando
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

      {/* ── Req 3: Modal de confirmación al Volver con cambios sin guardar ── */}
      {showBackModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-full bg-amber-100 text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-900">Cambios sin guardar</h3>
                <p className="text-xs text-gray-500">Hay progreso que no fue guardado.</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100">
              Tienes cambios pendientes en esta ejecución. ¿Qué deseas hacer antes de volver?
              El estado de la ejecución <span className="font-semibold text-gray-900">no cambiará</span> al volver.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBackModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBackWithoutSaving}
                className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                No guardar y Volver
              </button>
              <button
                type="button"
                onClick={handleBackWithSaving}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar y Volver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
