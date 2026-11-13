import type { FieldType } from './procedures';

/**
 * Supported execution states enforced via CHECK constraint in the database.
 */
export type ExecutionState =
    | 'ACTIVE'
    | 'PAUSED'
    | 'CANCELLED'
    | 'PENDING_EVALUATION'
    | 'HAS_CORRECTIONS'
    | 'APPROVED_FINISHED';

/**
 * UI display labels for execution states in Spanish.
 */
export const EXECUTION_STATE_LABELS: Record<ExecutionState, string> = {
    ACTIVE: 'Activo',
    PAUSED: 'Pausado',
    CANCELLED: 'Cancelado',
    PENDING_EVALUATION: 'A Evaluar',
    HAS_CORRECTIONS: 'Con Correcciones',
    APPROVED_FINISHED: 'Aprobado y Finalizado',
};

/**
 * Represents the EJECUCIONES entity in the database.
 */
export interface Execution {
    id: number;
    idProcedure: number;
    idProject: number;
    idDeveloper: number;
    state: ExecutionState;
    startedAt: string; // ISO Datetime
    endedAt?: string | null; // ISO Datetime
}

/**
 * Represents the INPUTS entity (subtype of TraceableElement).
 */
export interface Input {
    id: number; // PK, FK -> TraceableElement.idElement
    idExecution: number;
    idField: number;
    fieldType: FieldType;
    content: string;
    createdAt: string; // ISO Datetime
}

/**
 * Represents the EVALUACIONES entity in the database.
 */
export interface Evaluation {
    id: number;
    idExecution: number;
    idEvaluator: number;
    startedAt: string; // ISO Datetime
    endedAt?: string | null; // ISO Datetime
}

/**
 * Represents the CORRECCIONES entity in the database.
 * Targets any TraceableElement (Step, Section, Field, or Input) via idEvaluatedElement.
 */
export interface Correction {
    id: number;
    idEvaluation: number;
    idEvaluatedElement: number; // FK -> TraceableElement.idElement
    isDirectEdit: boolean;
    type?: FieldType | null;
    content?: string | null;
    createdAt: string; // ISO Datetime
}

/**
 * DTOs for Execution and Evaluation workflows (HU-009 to HU-015).
 */
export interface CreateExecutionDTO {
    idProcedure: number;
    idProject: number;
}

export interface SubmitInputDTO {
    idExecution: number;
    idField: number;
    fieldType: FieldType;
    content: string;
    idPreviousVersion?: number | null;
}

export interface CreateEvaluationDTO {
    idExecution: number;
}

export interface CreateCorrectionDTO {
    idEvaluation: number;
    idEvaluatedElement: number;
    isDirectEdit: boolean;
    type?: FieldType | null;
    content?: string | null;
}