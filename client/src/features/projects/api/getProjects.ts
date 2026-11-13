import type { User } from '@/features/auth/types';
import { storage } from '@/services/storage';
import type { ClientProject } from '../types';

function isAssigned(project: ClientProject, userId: string): boolean {
  return project.leaderIds.includes(userId) || project.memberIds.includes(userId);
}

export const getProjects = async (
  organizationId: string,
  actor: User,
): Promise<ClientProject[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const projects = storage
    .getProjectsByOrganization(organizationId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  if (actor.role === 'ORGANIZACION') {
    return projects;
  }

  if (actor.role === 'LIDER' || actor.role === 'DESARROLLADOR') {
    return projects.filter((project) => isAssigned(project, actor.id));
  }

  return [];
};
