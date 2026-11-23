import { Request, Response } from 'express';
import { executionsService } from './executions.service';
import type { ExecutionState, FieldType, RoleCode } from '@pm/shared';

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
    console.error('[ExecutionsController]', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
};

export class ExecutionsController {
    async getExecutions(req: Request, res: Response): Promise<void> {
        try {
            const { userId, role } = getAuthContext(res);
            let devId: number | undefined;
            if (role === 'DEVELOPER') {
                devId = userId;
            } else if (req.query.developerId) {
                devId = Number(req.query.developerId);
            }

            const list = await executionsService.getExecutions(devId);
            res.status(200).json(list);
        } catch (err) {
            serverError(res, err);
        }
    }

    async getExecutionDetails(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const execId = parseInt(idParam ?? '', 10);
        if (isNaN(execId)) {
            badRequest(res, 'ID de ejecución inválido.');
            return;
        }

        try {
            const details = await executionsService.getExecutionDetails(execId);
            if (!details) {
                res.status(404).json({ message: 'Ejecución no encontrada.' });
                return;
            }
            res.status(200).json(details);
        } catch (err) {
            serverError(res, err);
        }
    }

    async createExecution(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = getAuthContext(res);
            const { idProcedure, idProject, idDeveloper } = req.body;

            if (!idProcedure || !idProject) {
                badRequest(res, 'idProcedure e idProject son obligatorios.');
                return;
            }

            const exec = await executionsService.createExecution({
                idProcedure: Number(idProcedure),
                idProject: Number(idProject),
                idDeveloper: idDeveloper ? Number(idDeveloper) : userId,
            });

            res.status(201).json(exec);
        } catch (err) {
            serverError(res, err);
        }
    }

    async updateState(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const execId = parseInt(idParam ?? '', 10);
        if (isNaN(execId)) {
            badRequest(res, 'ID de ejecución inválido.');
            return;
        }

        const { state } = req.body as { state: ExecutionState };
        if (!state) {
            badRequest(res, 'El estado es requerido.');
            return;
        }

        try {
            await executionsService.updateExecutionState(execId, state);
            res.status(200).json({ status: 'ok', state });
        } catch (err) {
            serverError(res, err);
        }
    }

    async saveInput(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const execId = parseInt(idParam ?? '', 10);
        if (isNaN(execId)) {
            badRequest(res, 'ID de ejecución inválido.');
            return;
        }

        const { idField, fieldType, content } = req.body as {
            idField: number;
            fieldType: FieldType;
            content: string;
        };

        if (!idField || !fieldType || content === undefined) {
            badRequest(res, 'idField, fieldType y content son requeridos.');
            return;
        }

        try {
            const input = await executionsService.saveInput({
                idExecution: execId,
                idField: Number(idField),
                fieldType,
                content: String(content),
            });
            res.status(200).json(input);
        } catch (err) {
            serverError(res, err);
        }
    }

    async getCompletedSteps(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const execId = parseInt(idParam ?? '', 10);
        if (isNaN(execId)) {
            badRequest(res, 'ID de ejecución inválido.');
            return;
        }

        try {
            const completedStepIds = await executionsService.getCompletedStepIds(execId);
            res.status(200).json({ completedStepIds });
        } catch (err) {
            serverError(res, err);
        }
    }

    async toggleStepCompleted(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const execId = parseInt(idParam ?? '', 10);
        const stepIdParam = Array.isArray(req.params.stepId) ? req.params.stepId[0] : req.params.stepId;
        const stepId = parseInt(stepIdParam ?? '', 10);

        if (isNaN(execId) || isNaN(stepId)) {
            badRequest(res, 'ID de ejecución o de paso inválido.');
            return;
        }

        try {
            const result = await executionsService.toggleStepCompleted(execId, stepId);
            res.status(200).json(result);
        } catch (err) {
            serverError(res, err);
        }
    }
}

export const executionsController = new ExecutionsController();
