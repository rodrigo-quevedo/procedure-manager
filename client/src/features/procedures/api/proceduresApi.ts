import { storage } from '@/services/storage';
import type { Procedure, Step, Section, Field } from '@shared/types';
import type { StepWithSections, SectionWithFields, ProcedureWithDetails } from '../types';

export const getProcedures = async (projectId?: number): Promise<Procedure[]> => {
  await new Promise((r) => setTimeout(r, 150));
  const procs = storage.getProcedures();
  if (projectId !== undefined) {
    return procs.filter((p) => p.idProject === projectId);
  }
  return procs;
};

export const getProcedureDetails = async (procedureId: number): Promise<ProcedureWithDetails | null> => {
  await new Promise((r) => setTimeout(r, 150));
  const proc = storage.getProcedureById(procedureId);
  if (!proc) return null;

  const allSteps = storage.getStepsByProcedure(procedureId);
  const stepsWithSections: StepWithSections[] = allSteps.map((step) => {
    const sections = storage.getSectionsByStep(step.id);
    const sectionsWithFields: SectionWithFields[] = sections.map((sec) => {
      const fields = storage.getFieldsBySection(sec.id);
      return {
        ...sec,
        fields,
      };
    });
    return {
      ...step,
      sections: sectionsWithFields,
    };
  });

  const projects = storage.getProjects();
  const project = projects.find((p) => String(p.id) === String(proc.idProject));
  const users = storage.getUsers();
  const creator = users.find((u) => String(u.id) === String(proc.idCreator));
  const approver = proc.idLeaderApprover
    ? users.find((u) => String(u.id) === String(proc.idLeaderApprover))
    : undefined;

  return {
    ...proc,
    creatorName: creator?.name || 'Desarrollador',
    approverName: approver?.name,
    projectName: project?.name || `Proyecto #${proc.idProject}`,
    steps: stepsWithSections,
  };
};

export interface SaveProcedureHierarchyInput {
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
}

export const saveProcedureHierarchy = async (
  input: SaveProcedureHierarchyInput
): Promise<Procedure> => {
  await new Promise((r) => setTimeout(r, 200));

  let procId = input.procedure.id;
  const isNew = !procId;

  if (isNew) {
    procId = Date.now();
  }

  const procedure: Procedure = {
    id: procId!,
    idProject: input.procedure.idProject,
    idCreator: input.idCreator,
    idLeaderApprover: input.procedure.idLeaderApprover || null,
    idPreviousVersion: input.procedure.idPreviousVersion || null,
    state: input.procedure.state || 'DRAFT',
    name: input.procedure.name,
    description: input.procedure.description,
    createdAt: input.procedure.createdAt || new Date().toISOString(),
    tags: input.procedure.tags || ['General'],
  };

  storage.saveProcedure(procedure);

  // Synchronize steps, sections and fields
  // Clean up previous elements of this procedure
  const existingSteps = storage.getSteps().filter((s) => s.idProcedure !== procId);
  const existingSections = storage.getSections().filter((sec) => !input.steps.some((s) => s.id === sec.idStep));
  const existingFields = storage.getFields().filter(
    (f) => !input.steps.some((s) => s.sections.some((sec) => sec.id === f.idSection))
  );

  const newSteps: Step[] = [];
  const newSections: Section[] = [];
  const newFields: Field[] = [];

  input.steps.forEach((step, sIdx) => {
    const stepId = step.id || Date.now() + sIdx * 100;
    newSteps.push({
      id: stepId,
      idProcedure: procId!,
      name: step.name,
      description: step.description,
      order: sIdx + 1,
    });

    step.sections.forEach((sec, secIdx) => {
      const secId = sec.id || Date.now() + sIdx * 100 + secIdx * 10;
      newSections.push({
        id: secId,
        idStep: stepId,
        name: sec.name,
        description: sec.description || '',
      });

      sec.fields.forEach((field, fIdx) => {
        const fieldId = field.id || Date.now() + sIdx * 100 + secIdx * 10 + fIdx + 1;
        newFields.push({
          id: fieldId,
          idSection: secId,
          fieldType: field.fieldType,
          content: field.content,
        });
      });
    });
  });

  storage.saveSteps([...existingSteps, ...newSteps]);
  storage.saveSections([...existingSections, ...newSections]);
  storage.saveFields([...existingFields, ...newFields]);

  return procedure;
};

export const updateProcedureState = async (
  procedureId: number,
  state: Procedure['state']
): Promise<void> => {
  await new Promise((r) => setTimeout(r, 150));
  const proc = storage.getProcedureById(procedureId);
  if (proc) {
    proc.state = state;
    storage.saveProcedure(proc);
  }
};
