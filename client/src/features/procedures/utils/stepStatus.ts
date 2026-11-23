import type { Step, Section, Field, ExecutionState, Input } from '@shared/types';
import type { InputWithCorrections } from '@/features/procedure_executions/types';

export type StepVisualStatus =
  | 'COMPLETED_GREEN'    // Verde: completado o con corrección implementada
  | 'CORRECTION_RED'     // Rojo: tiene corrección pendiente / observada
  | 'NORMAL_RED_BORDER'  // Blanco con borde rojo fino (normal en flujo de correcciones)
  | 'NORMAL_INCOMPLETE'; // Normal incompleto estándar

export interface StepStatusOptions {
  step: Step & { sections?: Array<Section & { fields: Field[] }> };
  executionState?: ExecutionState | null;
  completedStepIds?: Set<number>;
  inputs?: Array<Input | InputWithCorrections>;
  allCorrectionsCount?: number;
}

/**
 * Determina el estado visual de un paso según la lógica del sistema:
 * - APROBADO ('APPROVED_FINISHED'): todos los pasos se muestran completados en verde.
 * - CANCELADO ('CANCELLED') y EN PAUSA ('PAUSED'): solo los pasos completados se marcan en verde; los demás normales.
 * - CORRECCIONES PENDIENTES ('HAS_CORRECTIONS'):
 *     - Si el paso tiene correcciones pendientes (o el input tiene correcciones y no ha sido resuelto): bg rojo.
 *     - Si el paso fue marcado como completado o implementó la corrección: bg verde.
 *     - Pasos normales: bg blanco con borde rojo fino.
 * - PENDIENTE EVALUACIÓN ('PENDING_EVALUATION'):
 *     - Si la ejecución tenía correcciones (allCorrectionsCount > 0): sigue la lógica de correcciones pendientes.
 *     - Si no tenía correcciones: sigue la lógica de pausado/cancelado (solo los completados en verde).
 * - OTROS ESTADOS ('ACTIVE', 'DRAFT', etc.): los pasos completados en verde, los demás normales.
 */
export function getStepVisualStatus({
  step,
  executionState,
  completedStepIds = new Set(),
  inputs = [],
  allCorrectionsCount = 0,
}: StepStatusOptions): StepVisualStatus {
  const isMarkedCompleted = completedStepIds.has(step.id);

  // 1. APROBADO: Todos los pasos marcados completados verde
  if (executionState === 'APPROVED_FINISHED') {
    return 'COMPLETED_GREEN';
  }

  // Identificar si este paso específico tiene campos asociados a inputs con correcciones
  const stepFieldIds = new Set<number>();
  if (step.sections) {
    step.sections.forEach((sec) => {
      sec.fields?.forEach((f) => stepFieldIds.add(f.id));
    });
  }

  // Buscar si alguno de los inputs de este paso tiene correcciones
  const inputsInStep = inputs.filter((inp) => stepFieldIds.has(inp.idField));
  const hasCorrectionsInStep = inputsInStep.some((inp) => {
    const withCorr = inp as InputWithCorrections;
    return withCorr.corrections && withCorr.corrections.length > 0;
  });

  // 2. CORRECCIONES PENDIENTES o PENDIENTE EVALUACIÓN que tenía correcciones
  const followsCorrectionsLogic =
    executionState === 'HAS_CORRECTIONS' ||
    (executionState === 'PENDING_EVALUATION' && allCorrectionsCount > 0);

  if (followsCorrectionsLogic) {
    if (isMarkedCompleted) {
      // Pasos en los que se implementaron correcciones o fueron completados
      return 'COMPLETED_GREEN';
    }
    if (hasCorrectionsInStep) {
      // Pasos con correcciones pendientes
      return 'CORRECTION_RED';
    }
    // Pasos normales: bg blanco borde rojo fino
    return 'NORMAL_RED_BORDER';
  }

  // 3. CANCELADO, EN PAUSA o PENDIENTE EVALUACIÓN sin correcciones
  // Solo los completados marcados en verde; el resto normales
  if (isMarkedCompleted) {
    return 'COMPLETED_GREEN';
  }

  return 'NORMAL_INCOMPLETE';
}
