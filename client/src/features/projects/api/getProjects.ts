import type { ProjectDetailResponse } from '@pm/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const getToken = (): string => {
  const raw = localStorage.getItem('pm_auth_session');
  if (!raw) throw new Error('Sesión no encontrada. Por favor, inicia sesión nuevamente.');
  const session = JSON.parse(raw) as { token: string };
  return session.token;
};

export const getProjects = async (
  organizationId?: string | number,
  options?: { assignedOnly?: boolean },
): Promise<ProjectDetailResponse[]> => {
  const url = new URL(`${API_BASE}/api/projects`);
  if (organizationId) {
    url.searchParams.set('organizationId', String(organizationId));
  }
  if (options?.assignedOnly) {
    url.searchParams.set('assigned', 'true');
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? 'Error al obtener los proyectos.');
  }

  return res.json();
};
