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

  // If user not found, return generic error (no lockout tracking)
  if (!user) {
    throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
  }

  // Check if account is inactive / inhabilitada
  if (!user.isActive) {
    throw new Error('La cuenta está inhabilitada. Contacta al administrador.');
  }

  if (user.password !== password) {
    // Increment failed attempts
    const attempts = (user.failedLoginAttempts ?? 0) + 1;
    const shouldDeactivate = attempts >= 5;
    const updatedUser: User = {
      ...user,
      failedLoginAttempts: attempts,
      isActive: shouldDeactivate ? false : true,
    };
    storage.saveUser(updatedUser);

    if (shouldDeactivate) {
      throw new Error('Demasiados intentos fallidos. La cuenta ha sido desactivada.');
    }
    throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
  }

  // Successful login: reset counters and ensure active
  const updatedUser: User = {
    ...user,
    failedLoginAttempts: 0,
    isActive: true,
  };
  storage.saveUser(updatedUser);

  const organization = storage.getOrganizationById(user.organizationId);

  storage.setCurrentUser(updatedUser);
  storage.setCurrentOrganization(organization);

  return {
    user: updatedUser,
    organization: organization!,
  };
};
