import { storage } from '@/services/storage';
import { validateEmail, validatePassword } from '@/features/auth/utils/validation';
import type { User } from '@/features/auth/types';
import type { CreateMemberDTO } from '../types';

export const createMember = async (
  organizationId: string,
  data: CreateMemberDTO
): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  const trimmedName = data.name?.trim() ?? '';
  const trimmedEmail = data.email?.trim().toLowerCase() ?? '';
  const password = data.password ?? '';
  const role = data.role;

  // 1. Mandatory fields validation
  if (!trimmedName || !trimmedEmail || !password || !role) {
    throw new Error('Todos los campos son obligatorios (nombre completo, correo electrónico, contraseña y rol).');
  }

  // 2. Email format validation
  if (!validateEmail(trimmedEmail)) {
    throw new Error('Por favor, ingresa un formato de correo electrónico válido.');
  }

  // 3. Password requirements validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new Error(
      passwordValidation.message ||
        'La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula, un número y un carácter especial.'
    );
  }

  // 4. Check if email already registered
  const existingUser = storage.findUserByEmail(trimmedEmail);
  if (existingUser) {
    throw new Error('El correo electrónico ya se encuentra registrado.');
  }

  const now = new Date().toISOString();
  const userId = 'usr_' + Math.random().toString(36).substring(2, 10);

  const newMember: User = {
    id: userId,
    organizationId,
    name: trimmedName,
    email: trimmedEmail,
    password,
    role,
    isActive: true,
    createdAt: now,
    failedLoginAttempts: 0,
  };

  storage.saveUser(newMember);

  return newMember;
};

