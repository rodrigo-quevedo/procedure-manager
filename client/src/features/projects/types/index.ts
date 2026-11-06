export type ConfidentialityLevel = 'PUBLIC' | 'PRIVATE';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  confidentiality: ConfidentialityLevel;
  leaderIds: string[];
  memberIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAssignmentInput {
  name: string;
  confidentiality: string;
  leaderIds: string[];
  memberIds: string[];
}

export const CONFIDENTIALITY_LABELS: Record<ConfidentialityLevel, string> = {
  PUBLIC: 'Público',
  PRIVATE: 'Privado',
};
