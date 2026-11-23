import { executionsDAO, type ExecutionWithDetails, type ExecutionListItem } from './executions.dao';
import type { Execution, ExecutionState, Input, FieldType } from '@pm/shared';

export class ExecutionsService {
    async getExecutions(developerId?: number): Promise<ExecutionListItem[]> {
        return executionsDAO.findList(developerId);
    }

    async getExecutionDetails(executionId: number): Promise<ExecutionWithDetails | null> {
        return executionsDAO.findById(executionId);
    }

    async createExecution(data: {
        idProcedure: number;
        idProject: number;
        idDeveloper: number;
    }): Promise<Execution> {
        return executionsDAO.createExecution(data);
    }

    async updateExecutionState(executionId: number, state: ExecutionState): Promise<void> {
        await executionsDAO.updateState(executionId, state);
    }

    async saveInput(data: {
        idExecution: number;
        idField: number;
        fieldType: FieldType;
        content: string;
    }): Promise<Input> {
        return executionsDAO.saveInput(data);
    }

    async getCompletedStepIds(executionId: number): Promise<number[]> {
        return executionsDAO.getCompletedStepIds(executionId);
    }

    async toggleStepCompleted(
        executionId: number,
        stepId: number,
    ): Promise<{ completedStepIds: number[]; isCompleted: boolean }> {
        return executionsDAO.toggleStepCompleted(executionId, stepId);
    }
}

export const executionsService = new ExecutionsService();
