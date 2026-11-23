import type { Procedure, Step, Section, Field } from '@pm/shared';
import type { ProcedureWithDetails } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const getToken = (): string => {
  const raw = localStorage.getItem('pm_auth_session');
  if (!raw) throw new Error('Sesión no encontrada. Por favor, inicia sesión nuevamente.');
  const session = JSON.parse(raw) as { token: string };
  return session.token;
};

export const getProcedures = async (projectId?: number): Promise<Procedure[]> => {
  const url = new URL(`${API_BASE}/api/procedures`);
  if (projectId !== undefined) {
    url.searchParams.set('projectId', String(projectId));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al obtener procedimientos.');
  }

  return res.json();
};

export const getProcedureDetails = async (procedureId: number): Promise<ProcedureWithDetails | null> => {
  const res = await fetch(`${API_BASE}/api/procedures/${procedureId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al obtener el detalle del procedimiento.');
  }

  return res.json();
};

export interface SaveProcedureHierarchyInput {
  procedure: Partial<Procedure> & { idProject: number; name: string; description: string };
  steps: Array<
    Step & {
      sections: Array<
        Section & {
          fields: Field[];
        }
      >;
    }
  >;
  idCreator?: number;
}

export const saveProcedureHierarchy = async (
  input: SaveProcedureHierarchyInput
): Promise<ProcedureWithDetails> => {
  const res = await fetch(`${API_BASE}/api/procedures`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al guardar la jerarquía del procedimiento.');
  }

  return res.json();
};

export const updateProcedureState = async (
  procedureId: number,
  state: Procedure['state']
): Promise<void> => {
  const res = await fetch(`${API_BASE}/api/procedures/${procedureId}/state`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ state }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al actualizar el estado del procedimiento.');
  }
};
