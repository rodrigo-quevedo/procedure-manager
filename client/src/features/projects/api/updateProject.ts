import type { User } from '@/features/auth/types';
import { storage } from '@/services/storage';
import type { ClientProject, ProjectAssignmentInput } from '../types';
import { normalizeProjectAssignment } from '../utils/validateProject';

export const updateProject = async (
  projectId: string,
  actor: User,
  input: ProjectAssignmentInput,
): Promise<ClientProject> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const existing = storage.getProjects().find((project) => project.id === projectId);
  if (!existing || existing.organizationId !== actor.organizationId) {
    throw new Error('Proyecto no encontrado.');
  }

  const canEdit =
    actor.role === 'ORGANIZACION' ||
    (actor.role === 'LIDER' &&
      (existing.leaderIds.includes(actor.id) || existing.memberIds.includes(actor.id)));

  if (!canEdit) {
    throw new Error('No tienes permiso para editar este proyecto.');
  }

  const organizationMembers = storage
    .getUsersByOrganization(actor.organizationId)
    .filter((member) => member.role !== 'ORGANIZACION');

  const assignment = normalizeProjectAssignment(input, {
    actor,
    organizationMembers,
    previouslyAssignedIds: [...existing.leaderIds, ...existing.memberIds],
  });

  const updated: ClientProject = {
    ...existing,
    name: assignment.name,
    confidentiality: assignment.confidentiality,
    leaderIds: assignment.leaderIds,
    memberIds: assignment.memberIds,
    updatedAt: new Date().toISOString(),
  };

  storage.saveProject(updated);
  return updated;
};
