import { getDb } from '../../config/database';
import type {
    Execution,
    ExecutionState,
    Input,
    Evaluation,
    Correction,
    FieldType,
} from '@pm/shared';

export interface InputWithCorrections extends Input {
    corrections?: Correction[];
}

export interface ExecutionWithDetails extends Execution {
    procedureName: string;
    developerName: string;
    leaderName?: string;
    evaluatorName?: string;
    lastSubmittedAt?: string | null;
    lastEvaluatedAt?: string | null;
    inputs: InputWithCorrections[];
    evaluations?: Evaluation[];
    completedStepIds?: number[];
}

export interface ExecutionListItem extends Execution {
    procedureName: string;
    projectName: string;
    developerName: string;
    totalSteps: number;
    completedSteps: number;
    lastProgress: string;
}

interface ExecutionRow {
    id: number;
    id_procedure: number;
    id_project: number;
    id_developer: number;
    state: ExecutionState;
    started_at: string;
    ended_at: string | null;
    procedure_name?: string;
    project_name?: string;
    developer_name?: string;
}

interface InputRow {
    id_element: number;
    id_execution: number;
    id_field: number;
    field_type: FieldType;
    content: string;
    created_at: string;
}

interface EvaluationRow {
    id: number;
    id_execution: number;
    id_evaluator: number;
    started_at: string;
    ended_at: string | null;
    evaluator_name?: string;
}

interface CorrectionRow {
    id: number;
    id_evaluation: number;
    id_evaluated_element: number;
    is_direct_edit: number;
    type: FieldType | null;
    content: string | null;
    created_at: string;
}

export class ExecutionsDAO {
    async findList(developerId?: number): Promise<ExecutionListItem[]> {
        const db = await getDb();
        let query = `
            SELECT e.*,
                   p.name as procedure_name,
                   proj.name as project_name,
                   u.full_name as developer_name
              FROM EJECUCIONES e
              JOIN PROCEDIMIENTOS p  ON p.id = e.id_procedure
              JOIN PROYECTOS proj     ON proj.id = e.id_project
              JOIN USUARIOS u        ON u.id = e.id_developer
        `;
        const params: unknown[] = [];
        if (developerId !== undefined) {
            query += ` WHERE e.id_developer = ?`;
            params.push(developerId);
        }
        query += ` ORDER BY e.started_at DESC`;

        const rows = await db.all<ExecutionRow[]>(query, ...params);
        if (rows.length === 0) return [];

        const execIds = rows.map((r) => r.id);
        const placeholders = execIds.map(() => '?').join(',');

        const inputsCountRows = await db.all<{ id_execution: number; cnt: number }[]>(
            `SELECT id_execution, count(*) as cnt FROM INPUTS WHERE id_execution IN (${placeholders}) GROUP BY id_execution`,
            ...execIds,
        );
        const inputsCountMap = new Map<number, number>();
        for (const ic of inputsCountRows) {
            inputsCountMap.set(ic.id_execution, ic.cnt);
        }

        const completedCountRows = await db.all<{ id_execution: number; cnt: number }[]>(
            `SELECT id_execution, count(DISTINCT id_step) as cnt FROM PASOS_COMPLETADOS_EJECUCION WHERE id_execution IN (${placeholders}) GROUP BY id_execution`,
            ...execIds,
        );
        const completedCountMap = new Map<number, number>();
        for (const cc of completedCountRows) {
            completedCountMap.set(cc.id_execution, cc.cnt);
        }

        const stepsCountRows = await db.all<{ id_procedure: number; cnt: number }[]>(
            `SELECT id_procedure, count(*) as cnt FROM PASOS GROUP BY id_procedure`,
        );
        const stepsCountMap = new Map<number, number>();
        for (const sc of stepsCountRows) {
            stepsCountMap.set(sc.id_procedure, sc.cnt);
        }

        return rows.map((r) => {
            const totalSteps = stepsCountMap.get(r.id_procedure) || 1;
            const completedSteps = completedCountMap.has(r.id)
                ? completedCountMap.get(r.id)!
                : Math.min(inputsCountMap.get(r.id) || 0, totalSteps);

            let lastProgress = 'Inicio de ejecución';
            if (r.state === 'APPROVED_FINISHED') {
                lastProgress = 'Aprobado y finalizado con éxito';
            } else if (r.state === 'CANCELLED') {
                lastProgress = 'Cancelado por el usuario';
            } else if (r.state === 'PENDING_EVALUATION') {
                lastProgress = 'Enviado para evaluación por Líder';
            } else if (r.state === 'HAS_CORRECTIONS') {
                lastProgress = 'Líder solicitó correcciones en comprobante';
            } else if (r.state === 'PAUSED') {
                lastProgress = `${completedSteps} de ${totalSteps} pasos completados - Pausado`;
            } else {
                lastProgress = `${completedSteps} de ${totalSteps} pasos completados`;
            }

            return {
                id: r.id,
                idProcedure: r.id_procedure,
                idProject: r.id_project,
                idDeveloper: r.id_developer,
                state: r.state,
                startedAt: r.started_at,
                endedAt: r.ended_at ?? undefined,
                procedureName: r.procedure_name || `Procedimiento #${r.id_procedure}`,
                projectName: r.project_name || `Proyecto #${r.id_project}`,
                developerName: r.developer_name || 'Desarrollador',
                totalSteps,
                completedSteps,
                lastProgress,
            };
        });
    }

    async findById(executionId: number): Promise<ExecutionWithDetails | null> {
        const db = await getDb();
        const row = await db.get<ExecutionRow>(
            `SELECT e.*,
                   p.name as procedure_name,
                   u.full_name as developer_name
              FROM EJECUCIONES e
              JOIN PROCEDIMIENTOS p  ON p.id = e.id_procedure
              JOIN USUARIOS u        ON u.id = e.id_developer
             WHERE e.id = ?`,
            executionId,
        );
        if (!row) return null;

        const inputRows = await db.all<InputRow[]>(
            `SELECT * FROM INPUTS WHERE id_execution = ? ORDER BY created_at ASC`,
            executionId,
        );

        const evalRows = await db.all<EvaluationRow[]>(
            `SELECT ev.*, u.full_name as evaluator_name
               FROM EVALUACIONES ev
               JOIN USUARIOS u ON u.id = ev.id_evaluator
              WHERE ev.id_execution = ?
              ORDER BY ev.started_at DESC`,
            executionId,
        );

        let correctionRows: CorrectionRow[] = [];
        if (evalRows.length > 0) {
            const evalIds = evalRows.map((e) => e.id);
            const p = evalIds.map(() => '?').join(',');
            correctionRows = await db.all<CorrectionRow[]>(
                `SELECT * FROM CORRECCIONES WHERE id_evaluation IN (${p})`,
                ...evalIds,
            );
        }

        const correctionsByElement = new Map<number, Correction[]>();
        for (const c of correctionRows) {
            const list = correctionsByElement.get(c.id_evaluated_element) ?? [];
            list.push({
                id: c.id,
                idEvaluation: c.id_evaluation,
                idEvaluatedElement: c.id_evaluated_element,
                isDirectEdit: c.is_direct_edit === 1,
                type: c.type,
                content: c.content,
                createdAt: c.created_at,
            });
            correctionsByElement.set(c.id_evaluated_element, list);
        }

        const inputs: InputWithCorrections[] = inputRows.map((inp) => ({
            id: inp.id_element,
            idExecution: inp.id_execution,
            idField: inp.id_field,
            fieldType: inp.field_type,
            content: inp.content,
            createdAt: inp.created_at,
            corrections: correctionsByElement.get(inp.id_element) || [],
        }));

        const evaluations: Evaluation[] = evalRows.map((ev) => ({
            id: ev.id,
            idExecution: ev.id_execution,
            idEvaluator: ev.id_evaluator,
            startedAt: ev.started_at,
            endedAt: ev.ended_at ?? undefined,
        }));

        const lastInput = inputs.length > 0
            ? [...inputs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            : null;
        const lastSubmittedAt = lastInput ? lastInput.createdAt : row.started_at;

        const lastEval = evalRows.length > 0 ? evalRows[0] : null;
        const lastEvaluatedAt = lastEval ? (lastEval.ended_at || lastEval.started_at) : null;
        const evaluatorName = lastEval?.evaluator_name;

        const completedRows = await db.all<{ id_step: number }[]>(
            `SELECT id_step FROM PASOS_COMPLETADOS_EJECUCION WHERE id_execution = ?`,
            executionId,
        );
        const completedStepIds = completedRows.map((c) => c.id_step);

        return {
            id: row.id,
            idProcedure: row.id_procedure,
            idProject: row.id_project,
            idDeveloper: row.id_developer,
            state: row.state,
            startedAt: row.started_at,
            endedAt: row.ended_at ?? undefined,
            procedureName: row.procedure_name || `Procedimiento #${row.id_procedure}`,
            developerName: row.developer_name || 'Desarrollador',
            evaluatorName,
            lastSubmittedAt,
            lastEvaluatedAt,
            inputs,
            evaluations,
            completedStepIds,
        };
    }

    async createExecution(data: {
        idProcedure: number;
        idProject: number;
        idDeveloper: number;
    }): Promise<Execution> {
        const db = await getDb();
        const now = new Date().toISOString();
        const result = await db.run(
            `INSERT INTO EJECUCIONES (id_procedure, id_project, id_developer, state, started_at)
             VALUES (?, ?, ?, 'ACTIVE', ?)`,
            data.idProcedure,
            data.idProject,
            data.idDeveloper,
            now,
        );

        return {
            id: result.lastID!,
            idProcedure: data.idProcedure,
            idProject: data.idProject,
            idDeveloper: data.idDeveloper,
            state: 'ACTIVE',
            startedAt: now,
        };
    }

    async updateState(executionId: number, state: ExecutionState): Promise<void> {
        const db = await getDb();
        const now = new Date().toISOString();
        const isFinished = state === 'APPROVED_FINISHED' || state === 'CANCELLED';

        if (isFinished) {
            await db.run(
                `UPDATE EJECUCIONES SET state = ?, ended_at = ? WHERE id = ?`,
                state,
                now,
                executionId,
            );
        } else {
            await db.run(
                `UPDATE EJECUCIONES SET state = ? WHERE id = ?`,
                state,
                executionId,
            );
        }
    }

    async saveInput(data: {
        idExecution: number;
        idField: number;
        fieldType: FieldType;
        content: string;
    }): Promise<Input> {
        const db = await getDb();
        const now = new Date().toISOString();

        const existing = await db.get<InputRow>(
            `SELECT * FROM INPUTS WHERE id_execution = ? AND id_field = ?`,
            data.idExecution,
            data.idField,
        );

        if (existing) {
            await db.run(
                `UPDATE INPUTS SET field_type = ?, content = ? WHERE id_element = ?`,
                data.fieldType,
                data.content,
                existing.id_element,
            );
            return {
                id: existing.id_element,
                idExecution: existing.id_execution,
                idField: existing.id_field,
                fieldType: data.fieldType,
                content: data.content,
                createdAt: existing.created_at,
            };
        }

        const elResult = await db.run(
            `INSERT INTO ELEMENTOS_TRAZABLES (id_previous_version, created_at) VALUES (NULL, ?)`,
            now,
        );
        const elementId = elResult.lastID!;

        await db.run(
            `INSERT INTO INPUTS (id_element, id_execution, id_field, field_type, content, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            elementId,
            data.idExecution,
            data.idField,
            data.fieldType,
            data.content,
            now,
        );

        return {
            id: elementId,
            idExecution: data.idExecution,
            idField: data.idField,
            fieldType: data.fieldType,
            content: data.content,
            createdAt: now,
        };
    }

    async getCompletedStepIds(executionId: number): Promise<number[]> {
        const db = await getDb();
        const rows = await db.all<{ id_step: number }[]>(
            `SELECT id_step FROM PASOS_COMPLETADOS_EJECUCION WHERE id_execution = ?`,
            executionId,
        );
        return rows.map((r) => r.id_step);
    }

    async toggleStepCompleted(
        executionId: number,
        stepId: number,
    ): Promise<{ completedStepIds: number[]; isCompleted: boolean }> {
        const db = await getDb();
        const now = new Date().toISOString();

        const existing = await db.get<{ id_step: number }>(
            `SELECT id_step FROM PASOS_COMPLETADOS_EJECUCION WHERE id_execution = ? AND id_step = ?`,
            executionId,
            stepId,
        );

        let isCompleted: boolean;
        if (existing) {
            await db.run(
                `DELETE FROM PASOS_COMPLETADOS_EJECUCION WHERE id_execution = ? AND id_step = ?`,
                executionId,
                stepId,
            );
            await db.run(
                `UPDATE PASOS SET is_completed = 0 WHERE id_element = ?`,
                stepId,
            );
            isCompleted = false;
        } else {
            await db.run(
                `INSERT OR REPLACE INTO PASOS_COMPLETADOS_EJECUCION (id_execution, id_step, completed_at) VALUES (?, ?, ?)`,
                executionId,
                stepId,
                now,
            );
            await db.run(
                `UPDATE PASOS SET is_completed = 1 WHERE id_element = ?`,
                stepId,
            );
            isCompleted = true;
        }

        const completedStepIds = await this.getCompletedStepIds(executionId);
        return { completedStepIds, isCompleted };
    }
}

export const executionsDAO = new ExecutionsDAO();
