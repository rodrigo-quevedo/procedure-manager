/**
 * Supported field types within procedure sections.
 * Corresponds to the CHECK constraint in the database ('TEXT', 'CODE', 'IMAGE').
 */
export type FieldType = 'TEXT' | 'CODE' | 'IMAGE';

/**
 * UI display labels for field types in Spanish.
 */
export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
    TEXT: 'Texto',
    CODE: 'Código',
    IMAGE: 'Imagen',
};

/**
 * Represents the PROCEDURES entity / table.
 * Acts as the base standard procedure template linked to a specific project.
 */
export interface Procedure {
    idProcedure: number;
    idProject: number;
    idCreator: number; // User ID of the creator (Organization or Leader)
    idLeaderApprover?: number; // Optional User ID of approving Leader
    idPreviousVersion?: number; // Self-referencing FK for deviation traceability
    name: string;
    description: string;
    createdAt: string; // ISO Datetime string (e.g., "2026-11-08T19:00:00Z")
    tags?: string[]; // Array of tag names for UI filtering (e.g., ["Backend", "Seguridad", "CI/CD"])
}

/**
 * Represents a single procedure category tag.
 * Corresponds to the CATEGORIAS_PROCEDIMIENTO table in the database.
 */
export interface ProcedureCategory {
    idProcedure: number;
    name: string;
}

/**
 * Represents the STEPS entity / table.
 * Defines sequential ordered steps contained within a procedure.
 */
export interface Step {
    idStep: number;
    idProcedure: number;
    name: string;
    description: string;
    order: number;
}

/**
 * Represents the SECTIONS entity / table.
 * Structural grouping of fields inside a procedure step.
 */
export interface Section {
    idSection: number;
    idStep: number;
    name: string;
    description: string;
}

/**
 * Represents the FIELDS entity / table.
 * Individual input definition inside a section with typed dynamic content.
 */
export interface Field {
    idField: number;
    idSection: number;
    fieldType: FieldType;
    content: string;
}

/**
 * Data Transfer Object (DTO) for creating a new Field within a Section.
 */
export interface CreateFieldDTO {
    fieldType: FieldType;
    content: string;
}

/**
 * Data Transfer Object (DTO) for creating a new Section inside a Step.
 */
export interface CreateSectionDTO {
    name: string;
    description: string;
    fields?: CreateFieldDTO[];
}

/**
 * Data Transfer Object (DTO) for creating a new Step inside a Procedure.
 */
export interface CreateStepDTO {
    name: string;
    description: string;
    order: number;
    sections?: CreateSectionDTO[];
}

/**
 * Data Transfer Object (DTO) for creating a complete Procedure (HU-007).
 */
export interface CreateProcedureDTO {
    idProject: number;
    name: string;
    description: string;
    idPreviousVersion?: number;
    tags?: string[]; // Array of category names assigned to the procedure
    steps?: CreateStepDTO[];
}

/**
 * Composite model representing a fully loaded procedure with nested children for UI display.
 */
export interface SectionWithFields extends Section {
    fields: Field[];
}

export interface StepWithSections extends Step {
    sections: SectionWithFields[];
}

export interface ProcedureWithDetails extends Procedure {
    creatorName: string;
    approverName?: string;
    projectName: string;
    steps: StepWithSections[];
}