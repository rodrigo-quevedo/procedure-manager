import type { MemberResponse } from '@pm/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const getToken = (): string => {
  const raw = localStorage.getItem('pm_auth_session');
  if (!raw) throw new Error('Sesión no encontrada. Por favor, inicia sesión nuevamente.');
  const session = JSON.parse(raw) as { token: string };
  return session.token;
};

/**
 * PATCH /api/members/:id/status – enables or disables a member account (HU-004).
 */
export const toggleMemberStatus = async (
  memberId: number,
  isActive: boolean,
): Promise<MemberResponse> => {
  const res = await fetch(`${API_BASE}/api/members/${memberId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ isActive }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? 'Error al cambiar el estado del miembro.');
  }

  return res.json();
};
