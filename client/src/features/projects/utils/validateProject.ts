import type { MemberResponse, RoleCode, ConfidentialityLevel } from '@pm/shared';
import type { ProjectAssignmentInput } from '../types';

const CONFIDENTIALITY_LEVELS: ConfidentialityLevel[] = ['PUBLIC', 'PRIVATE'];

export interface NormalizedProjectAssignment {
  name: string;
  confidentiality: ConfidentialityLevel;
  leaderIds: number[];
  memberIds: number[];
}

interface ActorLike {
  id: number;
  role: RoleCode | string;
  isActive: boolean;
  name?: string;
  fullName?: string;
  organizationId?: string | number;
}

interface NormalizeOptions {
  actor: ActorLike;
  organizationMembers: MemberResponse[];
  ensureActorAsLeader?: boolean;
  previouslyAssignedIds?: number[];
}

function uniqueIds(ids: number[]): number[] {
  return [...new Set(ids)];
}

export function normalizeProjectAssignment(
  input: ProjectAssignmentInput,
  options: NormalizeOptions,
): NormalizedProjectAssignment {
  const { actor, organizationMembers } = options;

  const isOrg = actor.role === 'ORGANIZATION' || actor.role === 'ORGANIZACION';
  const isLeader = actor.role === 'LEADER' || actor.role === 'LIDER';

  if (!isOrg && !isLeader) {
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

  if (options.ensureActorAsLeader && isLeader && !leaderIds.includes(actor.id)) {
    leaderIds = [actor.id, ...leaderIds];
  }

  memberIds = memberIds.filter((id) => !leaderIds.includes(id));

  if (isOrg && leaderIds.length === 0) {
    throw new Error('Debes seleccionar al menos un Líder.');
  }

  if (isLeader) {
    const staysAssigned = leaderIds.includes(actor.id) || memberIds.includes(actor.id);
    if (!staysAssigned) {
      throw new Error('Debes permanecer asignado al proyecto.');
    }
  }

  const membersById = new Map(organizationMembers.map((member) => [member.id, member]));
  const previouslyAssigned = new Set(options.previouslyAssignedIds ?? []);

  const assertAssignable = (id: number, asLeader: boolean) => {
    const member = membersById.get(id);
    if (!member) {
      throw new Error('Uno de los miembros seleccionados no pertenece a la organización.');
    }
    if (!member.isActive && !previouslyAssigned.has(id)) {
      throw new Error(`No puedes asignar a ${member.fullName} porque su cuenta está inhabilitada.`);
    }
    const memberIsLeader = member.role === 'LEADER' || (member.role as string) === 'LIDER';
    if (asLeader && !memberIsLeader) {
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
