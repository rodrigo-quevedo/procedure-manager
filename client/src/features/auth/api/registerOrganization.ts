import type { RegisterOrganizationDTO } from '@pm/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * HU-001 – Calls the backend register endpoint and maps the
 * AuthTokenResponse to the client-side AuthSession shape.
 *
 * Returns void intentionally: RegisterForm shows a success banner and then
 * redirects the user to login rather than auto-logging them in.
 * Throw on any HTTP error so the form can display the message.
 */
export const registerOrganization = async (data: RegisterOrganizationDTO): Promise<void> => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? 'Error al registrar la organización.');
  }

  // Payload is available here if you need auto-login in the future:
  // const payload: AuthTokenResponse = await res.json();
};
