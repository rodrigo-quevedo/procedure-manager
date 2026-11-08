import type { User } from '@/features/auth/types';
import { storage } from '@/services/storage';
import type { Project } from '../types';

function isAssigned(project: Project, userId: string): boolean {
  return project.leaderIds.includes(userId) || project.memberIds.includes(userId);
}

export const getProjects = async (
  organizationId: string,
  actor: User,
): Promise<Project[]> => {
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
