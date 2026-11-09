import { FieldType } from '@/features/procedures/types';

/**
 * Supported execution states managed via CHECK constraint in the database.
 * Reflects both execution progress and evaluation stages.
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
 * Represents the EJECUCION entity / table.
 * Tracks execution status, assigned developer, and timeframe.
 */
export interface Execution {
    idExecution: number;
    idProcedure: number;
    idDeveloper: number; // Foreign key referencing User.idUser
    state: ExecutionState;
    startedAt: string; // ISO Datetime string (e.g., "2026-11-08T20:00:00Z")
    endedAt?: string; // Optional ISO Datetime string when finished/cancelled
}

/**
 * Represents the INPUT entity / table.
 * Stores values provided by the developer for a procedure field during execution.
 */
export interface Input {
    idInput: number;
    idExecution: number;
    idField: number;
    fieldType: FieldType; // Same CHECK constraint values as Field ('TEXT' | 'CODE' | 'IMAGE')
    content: string;
    createdAt: string; // ISO Datetime string
}

/**
 * Represents the EVALUACION entity / table.
 * Records evaluation periods conducted by a Leader on a submitted execution.
 */
export interface Evaluation {
    idEvaluation: number;
    idExecution: number;
    idEvaluator: number; // Foreign key referencing Leader User.idUser
    startedAt: string; // ISO Datetime string
    endedAt?: string; // Optional ISO Datetime string when evaluation round completes
}

/**
 * Represents the CORRECCIONES entity / table.
 * Stores corrections or feedback submitted by a Leader for a specific execution input.
 */
export interface Correction {
    idCorrection: number;
    idEvaluation: number;
    idInput: number;
    type: FieldType; // Same CHECK constraint values as Input / Field
    content: string;
    createdAt: string; // ISO Datetime string
}

/**
 * Data Transfer Object (DTO) for initiating a procedure execution (HU-007 / HU-009).
 */
export interface CreateExecutionDTO {
    idProcedure: number;
}

/**
 * Data Transfer Object (DTO) for submitting a field input value during execution.
 */
export interface SubmitInputDTO {
    idExecution: number;
    idField: number;
    fieldType: FieldType;
    content: string;
}

/**
 * Data Transfer Object (DTO) for creating an evaluation session (HU-013 / HU-014).
 */
export interface CreateEvaluationDTO {
    idExecution: number;
}

/**
 * Data Transfer Object (DTO) for adding feedback/corrections to an input.
 */
export interface CreateCorrectionDTO {
    idEvaluation: number;
    idInput: number;
    type: FieldType;
    content: string;
}

/**
 * Composite model containing inputs and corrections linked to an evaluation for UI display.
 */
export interface InputWithCorrections extends Input {
    corrections?: Correction[];
}

export interface ExecutionWithDetails extends Execution {
    procedureName: string;
    developerName: string;
    evaluatorName?: string;
    inputs: InputWithCorrections[];
    evaluations?: Evaluation[];
}