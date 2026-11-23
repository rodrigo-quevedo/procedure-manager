import { Request, Response } from 'express';
import { projectsService } from './projects.service';
import type { CreateProjectDTO, UpdateProjectDTO, RoleCode } from '@pm/shared';

const getAuthContext = (res: Response): { userId: number; role: RoleCode } => {
    const userId = res.locals.userId as number | undefined;
    const role = res.locals.role as RoleCode | undefined;
    if (!userId || !role) throw new Error('No autenticado.');
    return { userId, role };
};

const badRequest = (res: Response, message: string): void => {
    res.status(400).json({ message });
};

const serverError = (res: Response, err: unknown): void => {
    console.error('[ProjectsController]', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
};

export class ProjectsController {
    /**
     * GET /api/projects
     * Returns all accessible projects for the authenticated user/organization.
     */
    async getProjects(req: Request, res: Response): Promise<void> {
        try {
            const { userId, role } = getAuthContext(res);
            const organizationId = role === 'ORGANIZATION' ? userId : Number(req.query.organizationId || userId);
            const projects = await projectsService.getProjects(organizationId, userId, role);
            res.status(200).json(projects);
        } catch (err) {
            serverError(res, err);
        }
    }

    /**
     * GET /api/projects/:id
     * Returns a specific project.
     */
    async getProjectById(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const projectId = parseInt(idParam ?? '', 10);
        if (isNaN(projectId)) {
            badRequest(res, 'ID de proyecto inválido.');
            return;
        }

        try {
            const { userId, role } = getAuthContext(res);
            const organizationId = role === 'ORGANIZATION' ? userId : Number(req.query.organizationId || userId);
            const project = await projectsService.getProjectById(projectId, organizationId, userId, role);
            res.status(200).json(project);
        } catch (err) {
            if (err instanceof Error) {
                res.status(404).json({ message: err.message });
            } else {
                serverError(res, err);
            }
        }
    }

    /**
     * POST /api/projects
     * Creates a new project (HU-005).
     */
    async createProject(req: Request, res: Response): Promise<void> {
        const { name, confidentialityLevel, leaderIds, memberIds } =
            req.body as Partial<CreateProjectDTO>;

        if (!name?.trim()) {
            badRequest(res, 'El nombre del proyecto es obligatorio.');
            return;
        }

        if (!confidentialityLevel || !['PUBLIC', 'PRIVATE'].includes(confidentialityLevel)) {
            badRequest(res, 'El nivel de confidencialidad es obligatorio y debe ser PUBLIC o PRIVATE.');
            return;
        }

        try {
            console.log("Post request recibida /api/projects")
            const { userId, role } = getAuthContext(res);
            const organizationId = role === 'ORGANIZATION' ? userId : Number(req.body.organizationId || userId);
            const project = await projectsService.createProject(organizationId, userId, role, {
                name,
                confidentialityLevel,
                leaderIds: leaderIds || [],
                memberIds: memberIds || [],
            });
            res.status(201).json(project);
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json({ message: err.message });
            } else {
                serverError(res, err);
            }
        }
    }

    /**
     * PATCH /api/projects/:id
     * Updates an existing project (HU-006).
     */
    async updateProject(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const projectId = parseInt(idParam ?? '', 10);
        if (isNaN(projectId)) {
            badRequest(res, 'ID de proyecto inválido.');
            return;
        }

        const { name, confidentialityLevel, leaderIds, memberIds } =
            req.body as Partial<UpdateProjectDTO>;

        try {
            const { userId, role } = getAuthContext(res);
            const organizationId = role === 'ORGANIZATION' ? userId : Number(req.body.organizationId || userId);
            const updated = await projectsService.updateProject(projectId, organizationId, userId, role, {
                name,
                confidentialityLevel,
                leaderIds,
                memberIds,
            });
            res.status(200).json(updated);
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json({ message: err.message });
            } else {
                serverError(res, err);
            }
        }
    }
}

export const projectsController = new ProjectsController();
