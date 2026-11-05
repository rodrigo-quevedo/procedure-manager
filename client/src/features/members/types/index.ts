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

