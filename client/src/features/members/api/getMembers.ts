import type { MemberResponse } from '@pm/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/** Returns the stored JWT token from localStorage. */
const getToken = (): string => {
  const raw = localStorage.getItem('pm_auth_session');
  if (!raw) throw new Error('Sesión no encontrada. Por favor, inicia sesión nuevamente.');
  const session = JSON.parse(raw) as { token: string };
  return session.token;
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

/**
 * GET /api/members – returns all LEADER/DEVELOPER members of the authenticated org.
 */
export const getMembers = async (): Promise<MemberResponse[]> => {
  const res = await fetch(`${API_BASE}/api/members`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? 'Error al obtener los miembros.');
  }

  return res.json();
};
