import type { CreateProjectDTO, ProjectDetailResponse } from '@pm/shared';
import type { ProjectAssignmentInput } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const getToken = (): string => {
  const raw = localStorage.getItem('pm_auth_session');
  if (!raw) throw new Error('Sesión no encontrada. Por favor, inicia sesión nuevamente.');
  const session = JSON.parse(raw) as { token: string };
  return session.token;
};

export const createProject = async (
  input: ProjectAssignmentInput,
  organizationId?: string | number,
): Promise<ProjectDetailResponse> => {
  if (!input.confidentiality) {
    throw new Error('El nivel de confidencialidad es obligatorio.');
  }

  const payload: CreateProjectDTO & { organizationId?: number } = {
    name: input.name.trim(),
    confidentialityLevel: input.confidentiality,
    leaderIds: input.leaderIds,
    memberIds: input.memberIds,
  };

  if (organizationId) {
    payload.organizationId = Number(organizationId);
  }

  const res = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al crear el proyecto.');
  }

  return res.json();
};
