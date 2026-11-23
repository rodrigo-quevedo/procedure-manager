import { getDb } from '../../config/database';
import type {
    Project,
    ProjectDetailResponse,
    ConfidentialityLevel,
    RoleCode,
} from '@pm/shared';

interface ProjectRow {
    id: number;
    id_organization: number;
    id_creator: number;
    confidentiality_level: ConfidentialityLevel;
    name: string;
    created_at: string;
    updated_at: string;
}

interface ProjectMemberRow {
    id_project: number;
    id_member: number;
    assigned_at: string;
    role_code: RoleCode;
}

const rowToProject = (row: ProjectRow): Project & { updatedAt: string } => ({
    id: row.id,
    idOrganization: row.id_organization,
    idCreator: row.id_creator,
    confidentialityLevel: row.confidentiality_level,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export class ProjectsDAO {
    async findByOrganization(organizationId: number): Promise<ProjectDetailResponse[]> {
        const db = await getDb();
        const rows = await db.all<ProjectRow[]>(
            `SELECT * FROM PROYECTOS WHERE id_organization = ? ORDER BY created_at DESC`,
            organizationId,
        );

        if (rows.length === 0) return [];

        const projectIds = rows.map((r) => r.id);
        const placeholders = projectIds.map(() => '?').join(',');

        const membersRows = await db.all<ProjectMemberRow[]>(
            `SELECT mp.id_project, mp.id_member, mp.assigned_at, r.code as role_code
               FROM MIEMBROS_PROYECTO mp
               JOIN USUARIOS u ON u.id = mp.id_member
               JOIN ROLES r ON r.id_role = u.id_role
              WHERE mp.id_project IN (${placeholders})`,
            ...projectIds,
        );

        const projectMap = new Map<number, { leaderIds: number[]; memberIds: number[] }>();
        for (const p of rows) {
            projectMap.set(p.id, { leaderIds: [], memberIds: [] });
        }

        for (const m of membersRows) {
            const entry = projectMap.get(m.id_project);
            if (entry) {
                if (m.role_code === 'LEADER') {
                    entry.leaderIds.push(m.id_member);
                } else {
                    entry.memberIds.push(m.id_member);
                }
            }
        }

        return rows.map((r) => {
            const assignees = projectMap.get(r.id) ?? { leaderIds: [], memberIds: [] };
            return {
                ...rowToProject(r),
                leaderIds: assignees.leaderIds,
                memberIds: assignees.memberIds,
            };
        });
    }

    async findById(projectId: number): Promise<ProjectDetailResponse | null> {
        const db = await getDb();
        const row = await db.get<ProjectRow>(
            `SELECT * FROM PROYECTOS WHERE id = ?`,
            projectId,
        );
        if (!row) return null;

        const membersRows = await db.all<ProjectMemberRow[]>(
            `SELECT mp.id_project, mp.id_member, mp.assigned_at, r.code as role_code
               FROM MIEMBROS_PROYECTO mp
               JOIN USUARIOS u ON u.id = mp.id_member
               JOIN ROLES r ON r.id_role = u.id_role
              WHERE mp.id_project = ?`,
            projectId,
        );

        const leaderIds: number[] = [];
        const memberIds: number[] = [];
        for (const m of membersRows) {
            if (m.role_code === 'LEADER') {
                leaderIds.push(m.id_member);
            } else {
                memberIds.push(m.id_member);
            }
        }

        return {
            ...rowToProject(row),
            leaderIds,
            memberIds,
        };
    }

    async createProject(data: {
        organizationId: number;
        creatorId: number;
        name: string;
        confidentialityLevel: ConfidentialityLevel;
        assignedMemberIds: number[];
    }): Promise<number> {
        const db = await getDb();
        const now = new Date().toISOString();

        await db.run('BEGIN TRANSACTION');
        try {
            console.log("DAO activado. Ejecutando transaccion de insercion en la tabla PROYECTOS.")
            const result = await db.run(
                `INSERT INTO PROYECTOS (id_organization, id_creator, confidentiality_level, name, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                data.organizationId,
                data.creatorId,
                data.confidentialityLevel,
                data.name,
                now,
                now,
            );

            const projectId = result.lastID!;

            for (const memberId of data.assignedMemberIds) {
                await db.run(
                    `INSERT INTO MIEMBROS_PROYECTO (id_project, id_member, assigned_at)
                     VALUES (?, ?, ?)`,
                    projectId,
                    memberId,
                    now,
                );
            }

            await db.run('COMMIT');
            return projectId;
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    }

    async updateProject(
        projectId: number,
        data: {
            name?: string;
            confidentialityLevel?: ConfidentialityLevel;
            assignedMemberIds?: number[];
        },
    ): Promise<void> {
        const db = await getDb();
        const now = new Date().toISOString();

        await db.run('BEGIN TRANSACTION');
        try {
            if (data.name !== undefined || data.confidentialityLevel !== undefined) {
                const updates: string[] = ['updated_at = ?'];
                const values: unknown[] = [now];

                if (data.name !== undefined) {
                    updates.push('name = ?');
                    values.push(data.name);
                }
                if (data.confidentialityLevel !== undefined) {
                    updates.push('confidentiality_level = ?');
                    values.push(data.confidentialityLevel);
                }

                values.push(projectId);
                await db.run(
                    `UPDATE PROYECTOS SET ${updates.join(', ')} WHERE id = ?`,
                    ...values,
                );
            } else {
                await db.run(
                    `UPDATE PROYECTOS SET updated_at = ? WHERE id = ?`,
                    now,
                    projectId,
                );
            }

            if (data.assignedMemberIds !== undefined) {
                await db.run(
                    `DELETE FROM MIEMBROS_PROYECTO WHERE id_project = ?`,
                    projectId,
                );

                for (const memberId of data.assignedMemberIds) {
                    await db.run(
                        `INSERT INTO MIEMBROS_PROYECTO (id_project, id_member, assigned_at)
                         VALUES (?, ?, ?)`,
                        projectId,
                        memberId,
                        now,
                    );
                }
            }

            await db.run('COMMIT');
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    }
}

export const projectsDAO = new ProjectsDAO();
