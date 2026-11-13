/**
 * Supported procedure lifecycle states enforced via CHECK constraint.
 */
export type ProcedureState = 'DRAFT' | 'DEVIATION' | 'PENDING_APPROVAL' | 'APPROVED';

/**
 * Supported field types enforced via CHECK constraint ('TEXT', 'CODE', 'IMAGE').
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
 * Represents the supertype table ELEMENTOS_TRAZABLES.
 * Shared primary key parent for Steps, Sections, Fields, and Inputs.
 */
export interface TraceableElement {
    idElement: number;
    idPreviousVersion: number | null;
    createdAt: string; // ISO Datetime
}

/**
 * Represents the PROCEDIMIENTOS entity in the database.
 */
export interface Procedure {
    id: number;
    idProject: number;
    idCreator: number;
    idLeaderApprover?: number | null;
    idPreviousVersion?: number | null;
    state: ProcedureState;
    name: string;
    description: string;
    createdAt: string; // ISO Datetime
    tags?: string[];
}

/**
 * Represents the CATEGORIAS_PROCEDIMIENTO entity (composite PK: idProcedure + name).
 */
export interface ProcedureCategory {
    idProcedure: number;
    name: string;
}

/**
 * Represents the PASOS entity (subtype of TraceableElement).
 */
export interface Step {
    id: number; // PK, FK -> TraceableElement.idElement
    idProcedure: number;
    name: string;
    description: string;
    order: number;
}

/**
 * Represents the SECCIONES entity (subtype of TraceableElement).
 */
export interface Section {
    id: number; // PK, FK -> TraceableElement.idElement
    idStep: number;
    name: string;
    description: string;
}

/**
 * Represents the CAMPOS entity (subtype of TraceableElement).
 */
export interface Field {
    id: number; // PK, FK -> TraceableElement.idElement
    idSection: number;
    fieldType: FieldType;
    content: string;
}

/**
 * DTOs for creating procedure structures (HU-007 / HU-010).
 */
export interface CreateFieldDTO {
    fieldType: FieldType;
    content: string;
    idPreviousVersion?: number | null;
}

export interface CreateSectionDTO {
    name: string;
    description: string;
    idPreviousVersion?: number | null;
    fields?: CreateFieldDTO[];
}

export interface CreateStepDTO {
    name: string;
    description: string;
    order: number;
    idPreviousVersion?: number | null;
    sections?: CreateSectionDTO[];
}

export interface CreateProcedureDTO {
    idProject: number;
    name: string;
    description: string;
    idPreviousVersion?: number | null;
    tags?: string[];
    steps?: CreateStepDTO[];
}