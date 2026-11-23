/**
 * Project types for the client.
 *
 * Uses the shared types as the canonical source.
 */

export type {
  ConfidentialityLevel,
  Project,
  ProjectMember,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectDetailResponse,
} from '@pm/shared';

export { CONFIDENTIALITY_LABELS } from '@pm/shared';

import type { ConfidentialityLevel, ProjectDetailResponse } from '@pm/shared';

/**
 * Normalized project representation for client UI.
 * Compatible with ProjectDetailResponse from the backend.
 */
export type ClientProject = ProjectDetailResponse;

/** Input shape for project create / update forms in the client. */
export interface ProjectAssignmentInput {
  name: string;
  confidentiality: ConfidentialityLevel | '';
  leaderIds: number[];
  memberIds: number[];
}
