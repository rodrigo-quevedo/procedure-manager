import { proceduresDAO, type ProcedureWithDetails } from './procedures.dao';
import type { Procedure, ProcedureState, Step, Section, Field, RoleCode } from '@pm/shared';

export class ProceduresService {
    async getProcedures(projectId?: number): Promise<Procedure[]> {
        return proceduresDAO.findByProject(projectId);
    }

    async getProcedureDetails(procedureId: number): Promise<ProcedureWithDetails | null> {
        return proceduresDAO.findById(procedureId);
    }

    async saveProcedureHierarchy(input: {
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
        return proceduresDAO.saveHierarchy(input);
    }

    async updateProcedureState(
        procedureId: number,
        state: ProcedureState,
        userId: number,
        role: RoleCode,
    ): Promise<void> {
        const approverId = (role === 'LEADER' && state === 'APPROVED') ? userId : undefined;
        await proceduresDAO.updateState(procedureId, state, approverId);
    }
}

export const proceduresService = new ProceduresService();
