/**
 * Procedure types for the client.
 *
 * Re-exports all shared procedure types from @shared/types so the rest
 * of the client imports from a single, stable location.
 *
 * MIGRATION NOTE: This module previously declared its own copies of
 * Procedure, Step, Section, Field, etc.  Those duplicates have been
 * removed; the shared definitions (shared/types/procedures.ts) are now
 * the single source of truth for the entire codebase.
 */
export type {
  ProcedureState,
  FieldType,
  TraceableElement,
  Procedure,
  ProcedureCategory,
  Step,
  Section,
  Field,
  CreateFieldDTO,
  CreateSectionDTO,
  CreateStepDTO,
  CreateProcedureDTO,
} from '@shared/types';

export { FIELD_TYPE_LABELS } from '@shared/types';

// ---------------------------------------------------------------------------
// Client-only composite view models (not part of the shared contract)
// ---------------------------------------------------------------------------

import type { Step, Section, Field } from '@shared/types';

/** Section with its nested fields, used for rendering procedure detail views. */
export interface SectionWithFields extends Section {
  fields: Field[];
}

/** Step with its nested sections (and their fields), used for rendering. */
export interface StepWithSections extends Step {
  sections: SectionWithFields[];
}

import type { Procedure } from '@shared/types';

/**
 * Fully-hydrated procedure model used by detail-view components.
 * Extends the shared Procedure with denormalized display-only fields.
 */
export interface ProcedureWithDetails extends Procedure {
  creatorName: string;
  approverName?: string;
  projectName: string;
  steps: StepWithSections[];
}
