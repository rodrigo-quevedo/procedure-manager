import type {
  Execution,
  Input,
  ExecutionState,
  FieldType,
} from '@pm/shared';
import type { ExecutionWithDetails } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const getToken = (): string => {
  const raw = localStorage.getItem('pm_auth_session');
  if (!raw) throw new Error('Sesión no encontrada. Por favor, inicia sesión nuevamente.');
  const session = JSON.parse(raw) as { token: string };
  return session.token;
};

export interface ExecutionListItem extends Execution {
  procedureName: string;
  projectName: string;
  developerName: string;
  totalSteps: number;
  completedSteps: number;
  lastProgress: string;
}

export const getExecutions = async (developerId?: number): Promise<ExecutionListItem[]> => {
  const url = new URL(`${API_BASE}/api/executions`);
  if (developerId !== undefined) {
    url.searchParams.set('developerId', String(developerId));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al obtener ejecuciones.');
  }

  return res.json();
};

export const getExecutionDetails = async (executionId: number): Promise<ExecutionWithDetails | null> => {
  const res = await fetch(`${API_BASE}/api/executions/${executionId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al obtener detalle de ejecución.');
  }

  return res.json();
};

export const createExecution = async (
  idProcedure: number,
  idProject: number,
  idDeveloper?: number
): Promise<Execution> => {
  const res = await fetch(`${API_BASE}/api/executions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ idProcedure, idProject, idDeveloper }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al crear la ejecución.');
  }

  return res.json();
};

export const updateExecutionState = async (
  executionId: number,
  state: ExecutionState
): Promise<void> => {
  const res = await fetch(`${API_BASE}/api/executions/${executionId}/state`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ state }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al actualizar el estado de la ejecución.');
  }
};

export const saveExecutionInput = async (
  idExecution: number,
  idField: number,
  fieldType: FieldType,
  content: string
): Promise<Input> => {
  const res = await fetch(`${API_BASE}/api/executions/${idExecution}/inputs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ idField, fieldType, content }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al guardar input de la ejecución.');
  }

  return res.json();
};

export const getCompletedStepIds = async (executionId: number): Promise<number[]> => {
  const res = await fetch(`${API_BASE}/api/executions/${executionId}/completed-steps`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al obtener pasos completados.');
  }

  const data = (await res.json()) as { completedStepIds: number[] };
  return data.completedStepIds;
};

export const toggleStepCompleted = async (
  executionId: number,
  stepId: number
): Promise<{ completedStepIds: number[]; isCompleted: boolean }> => {
  const res = await fetch(`${API_BASE}/api/executions/${executionId}/steps/${stepId}/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al actualizar estado del paso.');
  }

  return res.json();
};
