import type { User, Organization } from '@/features/auth/types';
import type { ClientProject } from '@/features/projects/types';
import type {
  Procedure,
  Step,
  Section,
  Field,
  Execution,
  Input,
  Evaluation,
  Correction,
} from '@shared/types';

const STORAGE_KEYS = {
  ORGANIZATIONS: 'pm_organizations',
  USERS: 'pm_users',
  PROJECTS: 'pm_projects',
  PROCEDURES: 'pm_procedures',
  STEPS: 'pm_steps',
  SECTIONS: 'pm_sections',
  FIELDS: 'pm_fields',
  EXECUTIONS: 'pm_executions',
  INPUTS: 'pm_inputs',
  EVALUATIONS: 'pm_evaluations',
  CORRECTIONS: 'pm_corrections',
  CURRENT_USER: 'currentUser',
  CURRENT_ORGANIZATION: 'currentOrganization',
} as const;

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  // Organizations
  getOrganizations(): Organization[] {
    return safeParse<Organization[]>(localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS), []);
  },

  saveOrganization(organization: Organization): void {
    const orgs = storage.getOrganizations();
    const existingIndex = orgs.findIndex((item) => item.id === organization.id);
    if (existingIndex >= 0) {
      orgs[existingIndex] = organization;
    } else {
      orgs.push(organization);
    }
    localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));
  },

  getOrganizationById(id: string): Organization | null {
    const orgs = storage.getOrganizations();
    return orgs.find((org) => org.id === id) || null;
  },

  // Users
  getUsers(): User[] {
    return safeParse<User[]>(localStorage.getItem(STORAGE_KEYS.USERS), []);
  },

  saveUser(user: User): void {
    const users = storage.getUsers();
    const existingIndex = users.findIndex((item) => item.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUsersByOrganization(organizationId: string): User[] {
    const users = storage.getUsers();
    return users.filter((u) => u.organizationId === organizationId);
  },

  findUserByEmail(email: string): User | null {
    const users = storage.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Session / Current User
  getCurrentUser(): User | null {
    return safeParse<User | null>(localStorage.getItem(STORAGE_KEYS.CURRENT_USER), null);
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getCurrentOrganization(): Organization | null {
    return safeParse<Organization | null>(localStorage.getItem(STORAGE_KEYS.CURRENT_ORGANIZATION), null);
  },

  setCurrentOrganization(org: Organization | null): void {
    if (org) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ORGANIZATION, JSON.stringify(org));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ORGANIZATION);
    }
  },

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ORGANIZATION);
  },

  // Projects
  getProjects(): ClientProject[] {
    return safeParse<ClientProject[]>(localStorage.getItem(STORAGE_KEYS.PROJECTS), []);
  },

  saveProject(project: ClientProject): void {
    const projects = storage.getProjects();
    const existingIndex = projects.findIndex((item) => item.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  getProjectsByOrganization(organizationId: string): ClientProject[] {
    return storage.getProjects().filter((project) => project.organizationId === organizationId);
  },

  // Procedures
  getProcedures(): Procedure[] {
    return safeParse<Procedure[]>(localStorage.getItem(STORAGE_KEYS.PROCEDURES), []);
  },

  saveProcedure(procedure: Procedure): void {
    const items = storage.getProcedures();
    const idx = items.findIndex((p) => p.id === procedure.id);
    if (idx >= 0) {
      items[idx] = procedure;
    } else {
      items.push(procedure);
    }
    localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(items));
  },

  getProcedureById(id: number): Procedure | null {
    return storage.getProcedures().find((p) => p.id === id) || null;
  },

  // Steps
  getSteps(): Step[] {
    return safeParse<Step[]>(localStorage.getItem(STORAGE_KEYS.STEPS), []);
  },

  saveSteps(steps: Step[]): void {
    localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(steps));
  },

  getStepsByProcedure(procedureId: number): Step[] {
    return storage
      .getSteps()
      .filter((s) => s.idProcedure === procedureId)
      .sort((a, b) => a.order - b.order);
  },

  // Sections
  getSections(): Section[] {
    return safeParse<Section[]>(localStorage.getItem(STORAGE_KEYS.SECTIONS), []);
  },

  saveSections(sections: Section[]): void {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
  },

  getSectionsByStep(stepId: number): Section[] {
    return storage.getSections().filter((sec) => sec.idStep === stepId);
  },

  // Fields
  getFields(): Field[] {
    return safeParse<Field[]>(localStorage.getItem(STORAGE_KEYS.FIELDS), []);
  },

  saveFields(fields: Field[]): void {
    localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(fields));
  },

  getFieldsBySection(sectionId: number): Field[] {
    return storage.getFields().filter((f) => f.idSection === sectionId);
  },

  // Executions
  getExecutions(): Execution[] {
    return safeParse<Execution[]>(localStorage.getItem(STORAGE_KEYS.EXECUTIONS), []);
  },

  saveExecution(execution: Execution): void {
    const items = storage.getExecutions();
    const idx = items.findIndex((e) => e.id === execution.id);
    if (idx >= 0) {
      items[idx] = execution;
    } else {
      items.push(execution);
    }
    localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(items));
  },

  getExecutionById(id: number): Execution | null {
    return storage.getExecutions().find((e) => e.id === id) || null;
  },

  // Inputs
  getInputs(): Input[] {
    return safeParse<Input[]>(localStorage.getItem(STORAGE_KEYS.INPUTS), []);
  },

  saveInputs(inputs: Input[]): void {
    localStorage.setItem(STORAGE_KEYS.INPUTS, JSON.stringify(inputs));
  },

  getInputsByExecution(executionId: number): Input[] {
    return storage.getInputs().filter((inp) => inp.idExecution === executionId);
  },

  saveInput(input: Input): void {
    const inputs = storage.getInputs();
    const idx = inputs.findIndex((i) => i.id === input.id);
    if (idx >= 0) {
      inputs[idx] = input;
    } else {
      inputs.push(input);
    }
    localStorage.setItem(STORAGE_KEYS.INPUTS, JSON.stringify(inputs));
  },

  // Evaluations & Corrections (for viewing examples / details)
  getEvaluations(): Evaluation[] {
    return safeParse<Evaluation[]>(localStorage.getItem(STORAGE_KEYS.EVALUATIONS), []);
  },

  saveEvaluation(evaluation: Evaluation): void {
    const evals = storage.getEvaluations();
    const idx = evals.findIndex((e) => e.id === evaluation.id);
    if (idx >= 0) {
      evals[idx] = evaluation;
    } else {
      evals.push(evaluation);
    }
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evals));
  },

  getCorrections(): Correction[] {
    return safeParse<Correction[]>(localStorage.getItem(STORAGE_KEYS.CORRECTIONS), []);
  },

  saveCorrection(correction: Correction): void {
    const corrs = storage.getCorrections();
    const idx = corrs.findIndex((c) => c.id === correction.id);
    if (idx >= 0) {
      corrs[idx] = correction;
    } else {
      corrs.push(correction);
    }
    localStorage.setItem(STORAGE_KEYS.CORRECTIONS, JSON.stringify(corrs));
  },
};
