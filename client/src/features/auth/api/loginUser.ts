import type { LoginCredentialsDTO, AuthTokenResponse, AuthSession } from '@pm/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * HU-002 – Calls the backend login endpoint and maps the
 * AuthTokenResponse to the client-side AuthSession shape.
 */
export const loginUser = async (data: LoginCredentialsDTO): Promise<AuthSession> => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? 'Error al iniciar sesión.');
  }

  const payload: AuthTokenResponse = await res.json();

  const session: AuthSession = {
    user: payload.user,
    token: payload.accessToken,
    refreshToken: payload.refreshToken,
    expiresAt: Date.now() + payload.expiresIn * 1000,
  };

  return session;
};
