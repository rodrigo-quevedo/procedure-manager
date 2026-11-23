/**
 * Auth types for the client.
 *
 * Re-exports shared types that represent the real backend contract AND keeps
 * backward-compatible local types so the rest of the codebase (mock layer,
 * dashboards, member management, etc.) can migrate incrementally without
 * breaking.
 */

// ---------------------------------------------------------------------------
// Shared / backend types (real REST contract)
// ---------------------------------------------------------------------------
export type {
    RoleCode,
    Role,
    JWTPayload,
    RegisterOrganizationDTO,
    LoginCredentialsDTO,
    AuthTokenResponse,
    AuthSession,
    User,
} from '@pm/shared';

export { ROLE_LABELS } from '@pm/shared';

// ---------------------------------------------------------------------------
// Backward-compat aliases
// ---------------------------------------------------------------------------

/** @deprecated Use LoginCredentialsDTO from @pm/shared */
export type LoginDTO = import('@pm/shared').LoginCredentialsDTO;

// ---------------------------------------------------------------------------
// Client-only legacy types (mock layer – kept for incremental migration)
// Remove these once all consumers switch to the shared User / AuthSession.
// ---------------------------------------------------------------------------

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

/**
 * Lightweight organization record used by the localStorage mock.
 * @deprecated Will be removed once the backend provides organization data
 * as part of the JWT / user profile.
 */
export interface Organization {
    id: string;
    name: string;
    createdAt: string; // ISO Datetime
}
