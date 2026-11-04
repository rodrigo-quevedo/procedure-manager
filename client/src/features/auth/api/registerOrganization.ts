import { storage } from '@/services/storage';
import { validateEmail, validatePassword } from '../utils/validation';
import type { AuthSession, Organization, RegisterOrganizationDTO, User } from '../types';

export const registerOrganization = async (
  data: RegisterOrganizationDTO
): Promise<AuthSession> => {
  // Simulate network delay for realistic async flow
  await new Promise((resolve) => setTimeout(resolve, 500));

  const trimmedOrgName = data.organizationName?.trim() ?? '';
  const trimmedEmail = data.email?.trim().toLowerCase() ?? '';
  const password = data.password ?? '';

  // 1. Validate complete fields
  if (!trimmedOrgName) {
    throw new Error('El nombre de la organización es obligatorio.');
  }

  if (!trimmedEmail) {
    throw new Error('El correo electrónico es obligatorio.');
  }

  if (!validateEmail(trimmedEmail)) {
    throw new Error('Por favor, ingresa un formato de correo electrónico válido.');
  }

  if (!password) {
    throw new Error('La contraseña es obligatoria.');
  }

  // 2. Validate password criteria (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.message || 'La contraseña no cumple con los requisitos de seguridad.');
  }

  // 3. Check if email is already in use
  const existingUser = storage.findUserByEmail(trimmedEmail);
  if (existingUser) {
    throw new Error('El correo electrónico ya se encuentra registrado.');
  }

  const now = new Date().toISOString();
  const organizationId = 'org_' + Math.random().toString(36).substring(2, 10);
  const userId = 'usr_' + Math.random().toString(36).substring(2, 10);

  const newOrganization: Organization = {
    id: organizationId,
    name: trimmedOrgName,
    createdAt: now,
  };

  const newUser: User = {
    id: userId,
    organizationId,
    name: trimmedOrgName,
    email: trimmedEmail,
    password: data.password,
    role: 'ORGANIZATION',
    isActive: true,
    createdAt: now,
  };

  // Persist to localStorage
  storage.saveOrganization(newOrganization);
  storage.saveUser(newUser);

  // Set active session
  storage.setCurrentUser(newUser);
  storage.setCurrentOrganization(newOrganization);

  return {
    user: newUser,
    organization: newOrganization,
  };
};
