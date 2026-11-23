import { getDb } from '../../config/database';
import type {
    Procedure,
    ProcedureState,
    Step,
    Section,
    Field,
    FieldType,
} from '@pm/shared';

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

interface ProcedureRow {
    id: number;
    id_project: number;
    id_creator: number;
    id_leader_approver: number | null;
    id_previous_version: number | null;
    state: ProcedureState;
    name: string;
    description: string;
    created_at: string;
    creator_name?: string;
    approver_name?: string;
    project_name?: string;
}

interface StepRow {
    id_element: number;
    id_procedure: number;
    name: string;
    description: string;
    step_order: number;
    is_completed?: number;
}

interface SectionRow {
    id_element: number;
    id_step: number;
    name: string;
    description: string;
}

interface FieldRow {
    id_element: number;
    id_section: number;
    field_type: FieldType;
    content: string;
}

export class ProceduresDAO {
    async findByProject(projectId?: number): Promise<(Procedure & { stepNames?: string[]; stepDescriptions?: string[] })[]> {
        const db = await getDb();
        let query = `SELECT * FROM PROCEDIMIENTOS`;
        const params: unknown[] = [];
        if (projectId !== undefined) {
            query += ` WHERE id_project = ?`;
            params.push(projectId);
        }
        query += ` ORDER BY created_at DESC`;

        const rows = await db.all<ProcedureRow[]>(query, ...params);
        if (rows.length === 0) return [];

        const procIds = rows.map((r) => r.id);
        const placeholders = procIds.map(() => '?').join(',');
        const tagRows = await db.all<{ id_procedure: number; name: string }[]>(
            `SELECT id_procedure, name FROM CATEGORIAS_PROCEDIMIENTO WHERE id_procedure IN (${placeholders})`,
            ...procIds,
        );

        const tagsMap = new Map<number, string[]>();
        for (const t of tagRows) {
            const list = tagsMap.get(t.id_procedure) ?? [];
            list.push(t.name);
            tagsMap.set(t.id_procedure, list);
        }

        const stepsRows = await db.all<{ id_procedure: number; name: string; description: string }[]>(
            `SELECT id_procedure, name, description FROM PASOS WHERE id_procedure IN (${placeholders})`,
            ...procIds,
        );

        const stepsMap = new Map<number, { names: string[]; descs: string[] }>();
        for (const s of stepsRows) {
            const item = stepsMap.get(s.id_procedure) ?? { names: [], descs: [] };
            if (s.name) item.names.push(s.name);
            if (s.description) item.descs.push(s.description);
            stepsMap.set(s.id_procedure, item);
        }

        return rows.map((r) => {
            const stepInfo = stepsMap.get(r.id);
            return {
                id: r.id,
                idProject: r.id_project,
                idCreator: r.id_creator,
                idLeaderApprover: r.id_leader_approver ?? undefined,
                idPreviousVersion: r.id_previous_version ?? undefined,
                state: r.state,
                name: r.name,
                description: r.description,
                createdAt: r.created_at,
                tags: tagsMap.get(r.id) || ['General'],
                stepNames: stepInfo?.names || [],
                stepDescriptions: stepInfo?.descs || [],
            };
        });
    }

    async findById(procedureId: number): Promise<ProcedureWithDetails | null> {
        const db = await getDb();
        const row = await db.get<ProcedureRow>(
            `SELECT p.*, 
                    u_creator.full_name as creator_name,
                    u_approver.full_name as approver_name,
                    proj.name as project_name
               FROM PROCEDIMIENTOS p
               LEFT JOIN USUARIOS u_creator  ON u_creator.id = p.id_creator
               LEFT JOIN USUARIOS u_approver ON u_approver.id = p.id_leader_approver
               LEFT JOIN PROYECTOS proj      ON proj.id = p.id_project
              WHERE p.id = ?`,
            procedureId,
        );
        if (!row) return null;

        const tagRows = await db.all<{ name: string }[]>(
            `SELECT name FROM CATEGORIAS_PROCEDIMIENTO WHERE id_procedure = ?`,
            procedureId,
        );
        const tags = tagRows.map((t) => t.name);

        const stepRows = await db.all<StepRow[]>(
            `SELECT * FROM PASOS WHERE id_procedure = ? ORDER BY step_order ASC`,
            procedureId,
        );

        const stepIds = stepRows.map((s) => s.id_element);
        let sectionRows: SectionRow[] = [];
        let fieldRows: FieldRow[] = [];

        if (stepIds.length > 0) {
            const stepPlaceholders = stepIds.map(() => '?').join(',');
            sectionRows = await db.all<SectionRow[]>(
                `SELECT * FROM SECCIONES WHERE id_step IN (${stepPlaceholders})`,
                ...stepIds,
            );

            const sectionIds = sectionRows.map((sec) => sec.id_element);
            if (sectionIds.length > 0) {
                const sectionPlaceholders = sectionIds.map(() => '?').join(',');
                fieldRows = await db.all<FieldRow[]>(
                    `SELECT * FROM CAMPOS WHERE id_section IN (${sectionPlaceholders})`,
                    ...sectionIds,
                );
            }
        }

        const fieldsBySection = new Map<number, Field[]>();
        for (const f of fieldRows) {
            const list = fieldsBySection.get(f.id_section) ?? [];
            list.push({
                id: f.id_element,
                idSection: f.id_section,
                fieldType: f.field_type,
                content: f.content,
            });
            fieldsBySection.set(f.id_section, list);
        }

        const sectionsByStep = new Map<number, SectionWithFields[]>();
        for (const s of sectionRows) {
            const list = sectionsByStep.get(s.id_step) ?? [];
            list.push({
                id: s.id_element,
                idStep: s.id_step,
                name: s.name,
                description: s.description,
                fields: fieldsBySection.get(s.id_element) || [],
            });
            sectionsByStep.set(s.id_step, list);
        }

        const steps: StepWithSections[] = stepRows.map((st) => ({
            id: st.id_element,
            idProcedure: st.id_procedure,
            name: st.name,
            description: st.description,
            order: st.step_order,
            isCompleted: st.is_completed === 1,
            sections: sectionsByStep.get(st.id_element) || [],
        }));

        return {
            id: row.id,
            idProject: row.id_project,
            idCreator: row.id_creator,
            idLeaderApprover: row.id_leader_approver ?? undefined,
            idPreviousVersion: row.id_previous_version ?? undefined,
            state: row.state,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            tags: tags.length > 0 ? tags : ['General'],
            creatorName: row.creator_name || 'Desarrollador',
            approverName: row.approver_name || undefined,
            projectName: row.project_name || `Proyecto #${row.id_project}`,
            steps,
        };
    }

    async saveHierarchy(input: {
        procedure: Partial<Procedure> & { idProject: number; name: string; description: string };
        steps: Array<
            Step & {
                sections: Array<
                    Section & {
                        fields: Field[];
                    }
                >;
            }
        >;
        idCreator: number;
    }): Promise<ProcedureWithDetails> {
        const db = await getDb();
        const now = new Date().toISOString();

        await db.run('BEGIN TRANSACTION');
        try {
            let procId = input.procedure.id;

            if (procId) {
                await db.run(
                    `UPDATE PROCEDIMIENTOS 
                        SET name = ?, description = ?, state = COALESCE(?, state), id_leader_approver = COALESCE(?, id_leader_approver)
                      WHERE id = ?`,
                    input.procedure.name,
                    input.procedure.description,
                    input.procedure.state || null,
                    input.procedure.idLeaderApprover || null,
                    procId,
                );

                await db.run(`DELETE FROM CATEGORIAS_PROCEDIMIENTO WHERE id_procedure = ?`, procId);
            } else {
                const result = await db.run(
                    `INSERT INTO PROCEDIMIENTOS (id_project, id_creator, id_leader_approver, id_previous_version, state, name, description, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    input.procedure.idProject,
                    input.idCreator,
                    input.procedure.idLeaderApprover || null,
                    input.procedure.idPreviousVersion || null,
                    input.procedure.state || 'DRAFT',
                    input.procedure.name,
                    input.procedure.description,
                    now,
                );
                procId = result.lastID!;
            }

            const tags = input.procedure.tags || ['General'];
            for (const tag of tags) {
                await db.run(
                    `INSERT OR IGNORE INTO CATEGORIAS_PROCEDIMIENTO (id_procedure, name) VALUES (?, ?)`,
                    procId,
                    tag,
                );
            }

            // Remove previous steps and elements if updating
            const existingSteps = await db.all<{ id_element: number }[]>(
                `SELECT id_element FROM PASOS WHERE id_procedure = ?`,
                procId,
            );
            if (existingSteps.length > 0) {
                const elIds = existingSteps.map((s) => s.id_element);
                const p = elIds.map(() => '?').join(',');
                await db.run(`DELETE FROM ELEMENTOS_TRAZABLES WHERE id_element IN (${p})`, ...elIds);
            }

            // Insert steps, sections and fields
            for (let sIdx = 0; sIdx < input.steps.length; sIdx++) {
                const step = input.steps[sIdx];
                const stepEl = await db.run(
                    `INSERT INTO ELEMENTOS_TRAZABLES (id_previous_version, created_at) VALUES (NULL, ?)`,
                    now,
                );
                const stepId = stepEl.lastID!;
                await db.run(
                    `INSERT INTO PASOS (id_element, id_procedure, name, description, step_order, is_completed) VALUES (?, ?, ?, ?, ?, ?)`,
                    stepId,
                    procId,
                    step.name,
                    step.description,
                    sIdx + 1,
                    step.isCompleted ? 1 : 0,
                );

                for (let secIdx = 0; secIdx < (step.sections || []).length; secIdx++) {
                    const sec = step.sections[secIdx];
                    const secEl = await db.run(
                        `INSERT INTO ELEMENTOS_TRAZABLES (id_previous_version, created_at) VALUES (NULL, ?)`,
                        now,
                    );
                    const secId = secEl.lastID!;
                    await db.run(
                        `INSERT INTO SECCIONES (id_element, id_step, name, description) VALUES (?, ?, ?, ?)`,
                        secId,
                        stepId,
                        sec.name,
                        sec.description,
                    );

                    for (let fIdx = 0; fIdx < (sec.fields || []).length; fIdx++) {
                        const field = sec.fields[fIdx];
                        const fieldEl = await db.run(
                            `INSERT INTO ELEMENTOS_TRAZABLES (id_previous_version, created_at) VALUES (NULL, ?)`,
                            now,
                        );
                        const fieldId = fieldEl.lastID!;
                        await db.run(
                            `INSERT INTO CAMPOS (id_element, id_section, field_type, content) VALUES (?, ?, ?, ?)`,
                            fieldId,
                            secId,
                            field.fieldType,
                            field.content,
                        );
                    }
                }
            }

            await db.run('COMMIT');
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }

        const details = await this.findById(input.procedure.id || (await db.get<{ id: number }>('SELECT last_insert_rowid() as id'))!.id);
        return details!;
    }

    async updateState(procedureId: number, state: ProcedureState, approverId?: number): Promise<void> {
        const db = await getDb();
        if (approverId !== undefined) {
            await db.run(
                `UPDATE PROCEDIMIENTOS SET state = ?, id_leader_approver = ? WHERE id = ?`,
                state,
                approverId,
                procedureId,
            );
        } else {
            await db.run(
                `UPDATE PROCEDIMIENTOS SET state = ? WHERE id = ?`,
                state,
                procedureId,
            );
        }
    }
}

export const proceduresDAO = new ProceduresDAO();
