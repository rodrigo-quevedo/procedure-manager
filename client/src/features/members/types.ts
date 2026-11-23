/**
 * Member types for the client.
 *
 * Uses the shared backend types directly.
 * The old localStorage mock types (MemberRole with Spanish codes, string IDs)
 * have been replaced by the real backend contract.
 */

// -- Shared re-exports (backend contract) -----------------------------------
export type {
    RoleCode,
    MemberRoleCode,
    CreateMemberDTO,
    UpdateMemberDTO,
    MemberResponse,
} from '@pm/shared';

export { ROLE_LABELS } from '@pm/shared';

// -- Backward-compat aliases ------------------------------------------------
// Keep ClientRoleCode so other parts of the codebase that haven't migrated yet
// (e.g. ProjectsPanel, storage service) continue to compile.
export type { ClientRoleCode } from '@/features/auth/types';

/**
 * @deprecated Use MemberRoleCode from @pm/shared instead.
 * Kept only for components that haven't migrated away from Spanish role codes.
 */
export type MemberRole = import('@pm/shared').MemberRoleCode;
