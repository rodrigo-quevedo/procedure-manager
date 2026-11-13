/**
 * Project types for the client.
 *
 * Re-exports shared backend types and adds client-only extensions
 * needed while the app uses the localStorage mock layer.
 */

// -- Shared re-exports ------------------------------------------------------
export type { ConfidentialityLevel, Project, ProjectMember, CreateProjectDTO, UpdateProjectDTO } from '@shared/types';
export { CONFIDENTIALITY_LABELS } from '@shared/types';

// -- Client-only extensions -------------------------------------------------

import type { ConfidentialityLevel } from '@shared/types';

/**
 * Flattened project record used by the localStorage mock.
 * The real backend stores leader/member relationships in the
 * `ProjectMember` join table; the mock flattens them into arrays for simplicity.
 *
 * NOTE: Replace with the shared `Project` type once the REST API is integrated.
 */
export interface ClientProject {
  id: string;
  organizationId: string;
  name: string;
  confidentiality: ConfidentialityLevel;
  leaderIds: string[];
  memberIds: string[];
  createdBy: string;
  createdAt: string;  // ISO Datetime
  updatedAt: string;  // ISO Datetime
}

/** Input shape for project create / update forms in the client. */
export interface ProjectAssignmentInput {
  name: string;
  confidentiality: ConfidentialityLevel | '';
  leaderIds: string[];
  memberIds: string[];
}
