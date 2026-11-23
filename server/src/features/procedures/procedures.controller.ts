import { Request, Response } from 'express';
import { proceduresService } from './procedures.service';
import type { ProcedureState, RoleCode } from '@pm/shared';

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
    console.error('[ProceduresController]', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
};

export class ProceduresController {
    async getProcedures(req: Request, res: Response): Promise<void> {
        try {
            const projectIdParam = req.query.projectId ? Number(req.query.projectId) : undefined;
            const procs = await proceduresService.getProcedures(projectIdParam);
            res.status(200).json(procs);
        } catch (err) {
            serverError(res, err);
        }
    }

    async getProcedureDetails(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const procId = parseInt(idParam ?? '', 10);
        if (isNaN(procId)) {
            badRequest(res, 'ID de procedimiento inválido.');
            return;
        }

        try {
            const proc = await proceduresService.getProcedureDetails(procId);
            if (!proc) {
                res.status(404).json({ message: 'Procedimiento no encontrado.' });
                return;
            }
            res.status(200).json(proc);
        } catch (err) {
            serverError(res, err);
        }
    }

    async saveProcedureHierarchy(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = getAuthContext(res);
            const { procedure, steps } = req.body;

            if (!procedure || !procedure.idProject) {
                badRequest(res, 'Datos de procedimiento incompletos (idProject es obligatorio).');
                return;
            }

            procedure.name = (procedure.name && String(procedure.name).trim()) || 'Nuevo Procedimiento';
            procedure.description = procedure.description || '';

            const saved = await proceduresService.saveProcedureHierarchy({
                procedure,
                steps: steps || [],
                idCreator: procedure.idCreator || userId,
            });

            res.status(200).json(saved);
        } catch (err) {
            serverError(res, err);
        }
    }

    async updateState(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const procId = parseInt(idParam ?? '', 10);
        if (isNaN(procId)) {
            badRequest(res, 'ID de procedimiento inválido.');
            return;
        }

        const { state } = req.body as { state: ProcedureState };
        if (!state) {
            badRequest(res, 'El nuevo estado es requerido.');
            return;
        }

        try {
            const { userId, role } = getAuthContext(res);
            await proceduresService.updateProcedureState(procId, state, userId, role);
            res.status(200).json({ status: 'ok', state });
        } catch (err) {
            serverError(res, err);
        }
    }
}

export const proceduresController = new ProceduresController();
