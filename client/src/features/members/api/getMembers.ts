import { storage } from '@/services/storage';
import type { User } from '@/features/auth/types';

export const getMembers = async (organizationId: string): Promise<User[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const users = storage.getUsersByOrganization(organizationId);
  // Exclude the organization account itself if we want only project members (LIDER, DESARROLLADOR)
  return users.filter((u) => u.role !== 'ORGANIZACION');
};

