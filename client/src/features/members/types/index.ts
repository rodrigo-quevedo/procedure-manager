import type { Role, User } from '@/features/auth/types';

export type MemberRole = 'LIDER' | 'DESARROLLADOR';

export interface Member extends User {
  role: Role;
}

export interface CreateMemberDTO {
  name: string;
  email: string;
  password: string;
  role: MemberRole;
}

export interface UpdateMemberDTO {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: MemberRole;
}
/**
 * Supported user role codes within the system.
 * Determines permissions, access levels, and dashboard views.
 */
export type RoleCode = 'ORGANIZATION' | 'LEADER' | 'DEVELOPER';

/**
 * Represents the ROLES reference table in the database.
 * Used for role lookup, selection, and UI display.
 */
export interface Role {
  idRole: number;
  code: RoleCode;
  name: string; // Display label for the graphical user interface (e.g., "Líder Técnico")
}

/**
 * UI display labels for user roles in Spanish.
 */
export const ROLE_LABELS: Record<RoleCode, string> = {
  ORGANIZATION: 'Organización',
  LEADER: 'Líder Técnico',
  DEVELOPER: 'Desarrollador',
};

/**
 * Represents the consolidated USERS entity / table.
 * Stores account credentials, profile info, lock status, and registration timestamp.
 */
export interface User {
  idUser: number;
  email: string;
  passwordHash?: string; // Encrypted on backend; optional in client-side state for security
  fullName: string;
  role: RoleCode;
  isActive: boolean;
  failedLoginAttempts: number;
  registeredAt: string; // ISO Datetime string (e.g., "2026-11-07T23:00:00Z")
  lastPasswordUpdate?: string;
}

/**
 * Data Transfer Object (DTO) for initial Organization account registration (HU-001).
 */
export interface RegisterOrganizationDTO {
  organizationName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

/**
 * Data Transfer Object (DTO) for user login authentication (HU-002).
 */
export interface LoginCredentialsDTO {
  email: string;
  password: string;
}

/**
 * Active authenticated session structure stored in memory / localStorage.
 */
export interface AuthSession {
  user: Omit<User, 'passwordHash'>; // Excludes password hash for security on the client side
  token: string;
  loginTimestamp: string;
}