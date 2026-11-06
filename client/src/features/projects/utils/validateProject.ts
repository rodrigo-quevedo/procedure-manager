import type { User } from '@/features/auth/types';
import type { ConfidentialityLevel, ProjectAssignmentInput } from '../types';

const CONFIDENTIALITY_LEVELS: ConfidentialityLevel[] = ['PUBLIC', 'PRIVATE'];

export interface NormalizedProjectAssignment {
  name: string;
  confidentiality: ConfidentialityLevel;
  leaderIds: string[];
  memberIds: string[];
}

interface NormalizeOptions {
  actor: User;
  organizationMembers: User[];
  ensureActorAsLeader?: boolean;
  previouslyAssignedIds?: string[];
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter((id) => id.trim() !== ''))];
}

export function normalizeProjectAssignment(
  input: ProjectAssignmentInput,
  options: NormalizeOptions,
): NormalizedProjectAssignment {
  const { actor, organizationMembers } = options;

  if (actor.role !== 'ORGANIZACION' && actor.role !== 'LIDER') {
    throw new Error('No tienes permiso para gestionar proyectos.');
  }

  if (!actor.isActive) {
    throw new Error('Tu cuenta está inhabilitada y no puedes gestionar proyectos.');
  }

  const name = input.name?.trim() ?? '';
  if (!name) {
    throw new Error('El nombre del proyecto es obligatorio.');
  }
  if (name.length < 3) {
    throw new Error('El nombre del proyecto debe tener al menos 3 caracteres.');
  }
  if (name.length > 120) {
    throw new Error('El nombre del proyecto no puede superar los 120 caracteres.');
  }

  if (!input.confidentiality) {
    throw new Error('El nivel de confidencialidad es obligatorio.');
  }
  if (!CONFIDENTIALITY_LEVELS.includes(input.confidentiality as ConfidentialityLevel)) {
    throw new Error('Selecciona un nivel de confidencialidad válido (Público o Privado).');
  }

  let leaderIds = uniqueIds(input.leaderIds);
  let memberIds = uniqueIds(input.memberIds);

  if (options.ensureActorAsLeader && actor.role === 'LIDER' && !leaderIds.includes(actor.id)) {
    leaderIds = [actor.id, ...leaderIds];
  }

  memberIds = memberIds.filter((id) => !leaderIds.includes(id));

  if (actor.role === 'ORGANIZACION' && leaderIds.length === 0) {
    throw new Error('Debes seleccionar al menos un Líder.');
  }

  if (actor.role === 'LIDER') {
    const staysAssigned = leaderIds.includes(actor.id) || memberIds.includes(actor.id);
    if (!staysAssigned) {
      throw new Error('Debes permanecer asignado al proyecto.');
    }
  }

  const membersById = new Map(organizationMembers.map((member) => [member.id, member]));
  const previouslyAssigned = new Set(options.previouslyAssignedIds ?? []);

  const assertAssignable = (id: string, asLeader: boolean) => {
    const member = membersById.get(id);
    if (!member || member.organizationId !== actor.organizationId || member.role === 'ORGANIZACION') {
      throw new Error('Uno de los miembros seleccionados no pertenece a la organización.');
    }
    if (!member.isActive && !previouslyAssigned.has(id)) {
      throw new Error(`No puedes asignar a ${member.name} porque su cuenta está inhabilitada.`);
    }
    if (asLeader && member.role !== 'LIDER') {
      throw new Error('Solo los miembros con rol Líder pueden ser asignados como líderes del proyecto.');
    }
  };

  leaderIds.forEach((id) => assertAssignable(id, true));
  memberIds.forEach((id) => assertAssignable(id, false));

  return {
    name,
    confidentiality: input.confidentiality as ConfidentialityLevel,
    leaderIds,
    memberIds,
  };
}
