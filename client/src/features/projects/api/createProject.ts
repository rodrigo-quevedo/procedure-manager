import type { User } from '@/features/auth/types';
import { storage } from '@/services/storage';
import type { ClientProject, ProjectAssignmentInput } from '../types';
import { normalizeProjectAssignment } from '../utils/validateProject';

export const createProject = async (
  organizationId: string,
  actor: User,
  input: ProjectAssignmentInput,
): Promise<ClientProject> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (actor.organizationId !== organizationId) {
    throw new Error('No puedes crear proyectos fuera de tu organización.');
  }

  const organizationMembers = storage
    .getUsersByOrganization(organizationId)
    .filter((member) => member.role !== 'ORGANIZACION');

  const assignment = normalizeProjectAssignment(input, {
    actor,
    organizationMembers,
    ensureActorAsLeader: actor.role === 'LIDER',
  });

  const now = new Date().toISOString();
  const project: ClientProject = {
    id: `prj_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    organizationId,
    name: assignment.name,
    confidentiality: assignment.confidentiality,
    leaderIds: assignment.leaderIds,
    memberIds: assignment.memberIds,
    createdBy: actor.id,
    createdAt: now,
    updatedAt: now,
  };

  storage.saveProject(project);
  return project;
};
