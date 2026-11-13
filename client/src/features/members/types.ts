/**
 * Member types for the client.
 *
 * Re-exports shared backend types and adds client-only DTOs
 * needed by the localStorage mock layer.
 *
 * MIGRATION NOTE: `MemberRole` uses the Spanish-coded values ('LIDER',
 * 'DESARROLLADOR') that the localStorage mock relies on. The shared `RoleCode`
 * ('LEADER', 'DEVELOPER') is the real backend contract and should be used
 * once the REST API is integrated.
 */

// -- Shared re-exports ------------------------------------------------------
export type { RoleCode } from '@shared/types';
export { ROLE_LABELS } from '@shared/types';

// -- Client-only types ------------------------------------------------------

import type { ClientRoleCode } from '@/features/auth/types';

/**
 * Roles assignable to members within the client (excludes ORGANIZACION).
 */
export type MemberRole = Exclude<ClientRoleCode, 'ORGANIZACION'>;

/** DTO for creating a new member from the client form. */
export interface CreateMemberDTO {
  name: string;
  email: string;
  password: string;
  role: MemberRole;
}

/** DTO for updating an existing member. */
export interface UpdateMemberDTO {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: MemberRole;
}
