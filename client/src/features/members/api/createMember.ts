import type { CreateMemberDTO, MemberResponse } from '@pm/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const getToken = (): string => {
  const raw = localStorage.getItem('pm_auth_session');
  if (!raw) throw new Error('Sesión no encontrada. Por favor, inicia sesión nuevamente.');
  const session = JSON.parse(raw) as { token: string };
  return session.token;
};

/**
 * POST /api/members – creates a new LEADER/DEVELOPER member (HU-003).
 */
export const createMember = async (data: CreateMemberDTO): Promise<MemberResponse> => {
  const res = await fetch(`${API_BASE}/api/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? 'Error al crear el miembro.');
  }

  return res.json();
};
