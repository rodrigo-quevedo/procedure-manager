/**
 * Auth types for the client.
 *
 * Re-exports shared backend types and adds client-only extensions
 * needed while the app uses the localStorage mock layer.
 *
 * MIGRATION NOTE: `User` in this module is a CLIENT-SIDE EXTENSION that
 * uses string IDs and Spanish role codes ('ORGANIZACION', 'LIDER', 'DESARROLLADOR').
 * The shared `User` from `@shared/types` uses numeric IDs and English codes
 * ('ORGANIZATION', 'LEADER', 'DEVELOPER') and represents the real backend contract.
 * Once the REST API is integrated, replace this `User` with the shared one.
 */

// -- Shared re-exports (backend contract) -----------------------------------
// These are the real types used by the backend. Import them directly when
// interacting with the API layer.
export type { RoleCode, Role, JWTPayload, RegisterOrganizationDTO, LoginCredentialsDTO, AuthTokenResponse } from '@shared/types';
export { ROLE_LABELS } from '@shared/types';

// -- Client-only role codes (mock layer) ------------------------------------

/**
 * Role codes used by the localStorage mock.
 * Map to the shared `RoleCode` as follows:
 *   ORGANIZACION  → ORGANIZATION
 *   LIDER         → LEADER
 *   DESARROLLADOR → DEVELOPER
 */
export type ClientRoleCode = 'ORGANIZACION' | 'LIDER' | 'DESARROLLADOR';

/** Maps client role codes to their Spanish UI labels. */
export const CLIENT_ROLE_LABELS: Record<ClientRoleCode, string> = {
  ORGANIZACION: 'Organización',
  LIDER: 'Líder',
  DESARROLLADOR: 'Desarrollador',
};

// -- Client-only User type --------------------------------------------------

/**
 * User entity used throughout the client mock layer.
 * Intentionally named `User` for backward compatibility with all existing
 * imports (`import type { User } from '@/features/auth/types'`).
 *
 * Key differences from the shared `User`:
 *  - `id` is a string slug (e.g. `usr_abc123`) instead of a number.
 *  - `role` uses Spanish codes instead of English.
 *  - Includes `organizationId`, `name`, `password` (mock-only fields).
 */
export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  password: string;
  role: ClientRoleCode;
  isActive: boolean;
  failedLoginAttempts?: number;
  createdAt: string; // ISO Datetime
}

/**
 * Lightweight organization record used by the localStorage mock.
 */
export interface Organization {
  id: string;
  name: string;
  createdAt: string; // ISO Datetime
}

/**
 * Client-side session stored after login (mock layer).
 */
export interface AuthSession {
  user: User;
  organization: Organization;
}

/** DTO for user login. */
export interface LoginDTO {
  email: string;
  password: string;
}
