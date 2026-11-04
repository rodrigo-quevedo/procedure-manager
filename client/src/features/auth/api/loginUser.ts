import { storage } from '@/services/storage';
import type { AuthSession, LoginDTO, User } from '../types';

export const loginUser = async (data: LoginDTO): Promise<AuthSession> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const trimmedEmail = data.email?.trim().toLowerCase() ?? '';
  const password = data.password ?? '';

  if (!trimmedEmail) {
    throw new Error('El correo electrónico es obligatorio.');
  }

  if (!password) {
    throw new Error('La contraseña es obligatoria.');
  }

  const user = storage.findUserByEmail(trimmedEmail);
  if (!user || user.password !== password) {
    throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
  }

  if (!user.isActive) {
    throw new Error('Tu cuenta se encuentra inactiva. Contacta al administrador.');
  }

  const organization = storage.getOrganizationById(user.organizationId);

  storage.setCurrentUser(user);
  storage.setCurrentOrganization(organization);

  return {
    user,
    organization: organization!,
  };
};

