// export type ConfidentialityLevel = 'PUBLIC' | 'PRIVATE';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  confidentiality: ConfidentialityLevel;
  leaderIds: string[];
  memberIds: string[];
  createdBy: string;
  createdAt: string;
  // updatedAt: string;
}

export interface ProjectAssignmentInput {
  name: string;
  confidentiality: string;
  leaderIds: string[];
  memberIds: string[];
}

// export const CONFIDENTIALITY_LABELS: Record<ConfidentialityLevel, string> = {
//   PUBLIC: 'Público',
//   PRIVATE: 'Privado',
// };





/**
 * Supported confidentiality levels for projects within the system.
 * Governs access restrictions to project procedures and execution records.
 */
export type ConfidentialityLevel = 'PUBLIC' | 'PRIVATE';

/**
 * UI display labels for confidentiality levels in Spanish.
 */
export const CONFIDENTIALITY_LABELS: Record<ConfidentialityLevel, string> = {
  PUBLIC: 'Público',
  PRIVATE: 'Privado',
};

/**
 * Represents the main PROJECTS entity / table.
 * Created by an Organization or a Leader to group procedures and assign members.
 */
export interface Project {
  idProject: number;
  idOrganization: number;
  idCreator: number;
  confidentialityLevel: ConfidentialityLevel;
  name: string;
  createdAt: string; // ISO Datetime string (e.g., "2026-11-08T18:00:00Z")
  // updatedAt?: string;
}

/**
 * Represents the PROJECT_MEMBERS join table.
 * Maps current active participants (Leaders and Developers) assigned to a specific project.
 */
export interface ProjectMember {
  idProject: number;
  idMember: number; // Foreign key referencing User.idUser
  assignedAt: string; // ISO Datetime string (e.g., "2026-11-08T18:00:00Z")
}

/**
 * Data Transfer Object (DTO) for creating a new project (HU-005).
 */
export interface CreateProjectDTO {
  name: string;
  confidentialityLevel: ConfidentialityLevel;
  assignedMemberIds: number[]; // Array of member IDs (must include at least one Leader)
}

/**
 * Data Transfer Object (DTO) for updating project details (HU-006).
 */
export interface UpdateProjectDTO {
  name?: string;
  confidentialityLevel?: ConfidentialityLevel;
  assignedMemberIds?: number[];
}

/**
 * Extended project model including resolved member details for UI presentation.
 */
export interface ProjectWithDetails extends Project {
  creatorName: string;
  assignedMembersCount: number;
}