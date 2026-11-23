import type { UpdateMemberDTO, MemberResponse } from '@pm/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const getToken = (): string => {
  const raw = localStorage.getItem('pm_auth_session');
  if (!raw) throw new Error('Sesión no encontrada. Por favor, inicia sesión nuevamente.');
  const session = JSON.parse(raw) as { token: string };
  return session.token;
};

/**
 * PATCH /api/members/:id – updates a member's data (HU-004).
 */
export const updateMember = async (memberId: number, data: UpdateMemberDTO): Promise<MemberResponse> => {
  const res = await fetch(`${API_BASE}/api/members/${memberId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? 'Error al actualizar el miembro.');
  }

  return res.json();
};
