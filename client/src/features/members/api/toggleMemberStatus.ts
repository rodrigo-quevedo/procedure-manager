import { storage } from '@/services/storage';
import type { User } from '@/features/auth/types';

export const toggleMemberStatus = async (
  memberId: string,
  newStatus: boolean
): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const users = storage.getUsers();
  const member = users.find((u) => u.id === memberId);

  if (!member) {
    throw new Error('Miembro no encontrado.');
  }

  const updatedMember: User = {
    ...member,
    isActive: newStatus,
    // If activating, reset failed attempts so they can log in freely
    failedLoginAttempts: newStatus ? 0 : member.failedLoginAttempts,
  };

  storage.saveUser(updatedMember);

  // If the currently logged in user happens to be this member, sync active session
  const currentUser = storage.getCurrentUser();
  if (currentUser && currentUser.id === memberId) {
    storage.setCurrentUser(updatedMember);
  }

  return updatedMember;
};

