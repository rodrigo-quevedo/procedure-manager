/**
 * Procedure execution types for the client.
 *
 * Re-exports all shared execution types from @shared/types so the rest
 * of the client imports from a single, stable location.
 *
 * MIGRATION NOTE: This module previously declared its own copies of
 * Execution, Input, Evaluation, Correction, etc., and imported FieldType
 * from the local procedures feature.  Those duplicates have been removed;
 * the shared definitions (shared/types/executions.ts) are now the single
 * source of truth.
 */
export type {
  ExecutionState,
  Execution,
  Input,
  Evaluation,
  Correction,
  CreateExecutionDTO,
  SubmitInputDTO,
  CreateEvaluationDTO,
  CreateCorrectionDTO,
} from '@shared/types';

export { EXECUTION_STATE_LABELS } from '@shared/types';

// ---------------------------------------------------------------------------
// Client-only composite view models
// ---------------------------------------------------------------------------

import type { Input, Correction, Evaluation, Execution } from '@shared/types';

/** Input annotated with its corrections, used in evaluation detail views. */
export interface InputWithCorrections extends Input {
  corrections?: Correction[];
}

/** Fully-hydrated execution model used by detail-view components. */
export interface ExecutionWithDetails extends Execution {
  procedureName: string;
  developerName: string;
  evaluatorName?: string;
  inputs: InputWithCorrections[];
  evaluations?: Evaluation[];
}
