/**
 * Supported confidentiality levels enforced via CHECK constraint in the database.
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
 * Represents the PROYECTOS entity in the database.
 */
export interface Project {
    id: number;
    idOrganization: number;
    idCreator: number; // Organization or Leader User ID
    confidentialityLevel: ConfidentialityLevel;
    name: string;
    createdAt: string; // ISO Datetime
}

/**
 * Represents the MIEMBROS_PROYECTO join table.
 */
export interface ProjectMember {
    idProject: number;
    idMember: number;
    assignedAt: string; // ISO Datetime
}

/**
 * DTO for creating a new project (HU-005).
 */
export interface CreateProjectDTO {
    name: string;
    confidentialityLevel: ConfidentialityLevel;
    assignedMemberIds: number[];
}

/**
 * DTO for updating an existing project (HU-006).
 */
export interface UpdateProjectDTO {
    name?: string;
    confidentialityLevel?: ConfidentialityLevel;
    assignedMemberIds?: number[];
}