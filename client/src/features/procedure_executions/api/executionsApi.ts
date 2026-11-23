import { storage } from '@/services/storage';
import type {
  Execution,
  Input,
  ExecutionState,
  FieldType,
} from '@shared/types';
import type { ExecutionWithDetails, InputWithCorrections } from '../types';

export interface ExecutionListItem extends Execution {
  procedureName: string;
  projectName: string;
  developerName: string;
  totalSteps: number;
  completedSteps: number;
  lastProgress: string;
}

const DEFAULT_PROJECT_NAMES: Record<number, string> = {
  1: 'Sistema Core Backend',
  2: 'Base de Datos Local',
  3: 'Módulo de Seguridad',
  4: 'Almacenamiento Multimedia',
  5: 'Portal Clientes',
  6: 'Infraestructura Cloud',
};

export const getExecutions = async (developerId?: number): Promise<ExecutionListItem[]> => {
  await new Promise((r) => setTimeout(r, 150));
  const executions = storage.getExecutions();
  const filtered = developerId !== undefined
    ? executions.filter((e) => e.idDeveloper === developerId)
    : executions;

  const procedures = storage.getProcedures();
  const projects = storage.getProjects();
  const users = storage.getUsers();
  const inputs = storage.getInputs();
  void inputs;
  const steps = storage.getSteps();

  return filtered.map((exec) => {
    const proc = procedures.find((p) => p.id === exec.idProcedure);
    const proj = projects.find((p) => String(p.id) === String(exec.idProject));
  void proj;
    const dev = users.find((u) => String(u.id) === String(exec.idDeveloper));

    const procSteps = steps.filter((s) => s.idProcedure === exec.idProcedure);

    // Calculate completed steps from persisted localStorage marker (set by the execution view)
    const totalSteps = procSteps.length || 1;
    const rawCompleted = localStorage.getItem(`pm_completed_steps_${exec.id}`);
    let completedStepCount = 0;
    if (rawCompleted) {
      try {
        completedStepCount = (JSON.parse(rawCompleted) as number[]).length;
      } catch { completedStepCount = 0; }
    }
    const completedSteps = Math.min(completedStepCount, totalSteps);

    let lastProgress = 'Inicio de ejecución';
    if (exec.state === 'APPROVED_FINISHED') {
      lastProgress = 'Aprobado y finalizado con éxito';
    } else if (exec.state === 'CANCELLED') {
      lastProgress = 'Cancelado por el usuario';
    } else if (exec.state === 'PENDING_EVALUATION') {
      lastProgress = 'Enviado para evaluación por Líder';
    } else if (exec.state === 'HAS_CORRECTIONS') {
      lastProgress = 'Líder solicitó correcciones en comprobante';
    } else if (exec.state === 'PAUSED') {
      lastProgress = `${completedSteps} de ${totalSteps} pasos completados - Pausado`;
    } else {
      lastProgress = `${completedSteps} de ${totalSteps} pasos completados`;
    }

    const resolvedProjectName =
      proj?.name ||
      DEFAULT_PROJECT_NAMES[exec.idProject] ||
      `Proyecto #${exec.idProject}`;

    return {
      ...exec,
      procedureName: proc?.name || `Procedimiento #${exec.idProcedure}`,
      projectName: resolvedProjectName,
      developerName: dev?.name || 'Juan Pérez',
      totalSteps,
      completedSteps,
      lastProgress,
    };
  });
};

export const getExecutionDetails = async (executionId: number): Promise<ExecutionWithDetails | null> => {
  await new Promise((r) => setTimeout(r, 150));
  const exec = storage.getExecutionById(executionId);
  if (!exec) return null;

  const proc = storage.getProcedureById(exec.idProcedure);
  const users = storage.getUsers();
  const dev = users.find((u) => String(u.id) === String(exec.idDeveloper));

  // Buscar líder del proyecto / aprobador
  const projects = storage.getProjects();
  const proj = projects.find((p) => String(p.id) === String(exec.idProject));
  void proj;
  const leader = users.find((u) => u.role === 'LIDER');

  const inputs = storage.getInputsByExecution(executionId);
  const corrections = storage.getCorrections();

  const inputsWithCorrections: InputWithCorrections[] = inputs.map((inp) => ({
    ...inp,
    corrections: corrections.filter((c) => c.idEvaluatedElement === inp.id),
  }));

  const evaluations = storage.getEvaluations().filter((e) => e.idExecution === executionId);

  // Determinar última fecha de envío (último input o startedAt / endedAt)
  const lastInput = inputs.length > 0
    ? [...inputs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;
  const lastSubmittedAt = lastInput ? lastInput.createdAt : exec.startedAt;

  // Determinar última fecha de evaluación
  const lastEvaluation = evaluations.length > 0
    ? [...evaluations].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]
    : null;
  const lastEvaluatedAt = lastEvaluation ? (lastEvaluation.endedAt || lastEvaluation.startedAt) : null;

  const evaluatorUser = lastEvaluation ? users.find((u) => String(u.id) === String(lastEvaluation.idEvaluator)) : null;

  return {
    ...exec,
    procedureName: proc?.name || `Procedimiento #${exec.idProcedure}`,
    developerName: dev?.name || 'Desarrollador',
    leaderName: leader?.name || 'Líder del Proyecto',
    evaluatorName: evaluatorUser?.name || leader?.name,
    lastSubmittedAt,
    lastEvaluatedAt,
    inputs: inputsWithCorrections,
    evaluations,
  };
};

export const createExecution = async (
  idProcedure: number,
  idProject: number,
  idDeveloper: number
): Promise<Execution> => {
  await new Promise((r) => setTimeout(r, 150));
  const newExecution: Execution = {
    id: Date.now(),
    idProcedure,
    idProject,
    idDeveloper,
    state: 'ACTIVE',
    startedAt: new Date().toISOString(),
  };

  storage.saveExecution(newExecution);
  return newExecution;
};

export const updateExecutionState = async (
  executionId: number,
  state: ExecutionState
): Promise<void> => {
  await new Promise((r) => setTimeout(r, 150));
  const exec = storage.getExecutionById(executionId);
  if (exec) {
    exec.state = state;
    if (state === 'APPROVED_FINISHED' || state === 'CANCELLED') {
      exec.endedAt = new Date().toISOString();
    }
    storage.saveExecution(exec);
  }
};

export const saveExecutionInput = async (
  idExecution: number,
  idField: number,
  fieldType: FieldType,
  content: string
): Promise<Input> => {
  await new Promise((r) => setTimeout(r, 100));
  const existingInputs = storage.getInputsByExecution(idExecution);
  const found = existingInputs.find((i) => i.idField === idField);

  if (found) {
    found.fieldType = fieldType;
    found.content = content;
    storage.saveInput(found);
    return found;
  }

  const newInput: Input = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    idExecution,
    idField,
    fieldType,
    content,
    createdAt: new Date().toISOString(),
  };

  storage.saveInput(newInput);
  return newInput;
};
