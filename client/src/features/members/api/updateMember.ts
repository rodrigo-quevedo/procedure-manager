import { storage } from '@/services/storage';
import { validateEmail, validatePassword } from '@/features/auth/utils/validation';
import type { User } from '@/features/auth/types';
import type { UpdateMemberDTO } from '../types';

export const updateMember = async (data: UpdateMemberDTO): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const trimmedName = data.name?.trim() ?? '';
  const trimmedEmail = data.email?.trim().toLowerCase() ?? '';
  const role = data.role;

  if (!trimmedName || !trimmedEmail || !role) {
    throw new Error('El nombre completo, correo electrónico y rol son obligatorios.');
  }

  if (!validateEmail(trimmedEmail)) {
    throw new Error('Por favor, ingresa un correo electrónico válido.');
  }

  const users = storage.getUsers();
  const member = users.find((u) => u.id === data.id);

  if (!member) {
    throw new Error('Miembro no encontrado.');
  }

  // Check if email changed and if it is taken by another user
  if (trimmedEmail !== member.email.toLowerCase()) {
    const emailTaken = users.some(
      (u) => u.id !== member.id && u.email.toLowerCase() === trimmedEmail
    );
    if (emailTaken) {
      throw new Error('El correo electrónico ya se encuentra en uso por otro usuario.');
    }
  }

  // Password update validation (if provided)
  let newPassword = member.password;
  if (data.password && data.password.trim() !== '') {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(
        passwordValidation.message ||
          'La nueva contraseña debe cumplir con los requisitos de seguridad.'
      );
    }
    newPassword = data.password;
  }

  const updatedMember: User = {
    ...member,
    name: trimmedName,
    email: trimmedEmail,
    role,
    password: newPassword,
  };

  storage.saveUser(updatedMember);

  // Sync if this user is current
  const currentUser = storage.getCurrentUser();
  if (currentUser && currentUser.id === member.id) {
    storage.setCurrentUser(updatedMember);
  }

  return updatedMember;
};

