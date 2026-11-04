export type Role = 'ORGANIZACION' | 'LIDER' | 'DESARROLLADOR';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  failedLoginAttempts?: number;
}


export interface AuthSession {
  user: User;
  organization: Organization;
}

export interface RegisterOrganizationDTO {
  organizationName: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}


