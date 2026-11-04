import type { Organization, User } from '@/features/auth/types';

const STORAGE_KEYS = {
  ORGANIZATIONS: 'pm_organizations',
  USERS: 'pm_users',
  CURRENT_USER: 'currentUser',
  CURRENT_ORGANIZATION: 'currentOrganization',
} as const;

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  // Organizations
  getOrganizations(): Organization[] {
    return safeParse<Organization[]>(localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS), []);
  },

  saveOrganization(organization: Organization): void {
    const orgs = storage.getOrganizations();
    const existingIndex = orgs.findIndex((item) => item.id === organization.id);
    if (existingIndex >= 0) {
      orgs[existingIndex] = organization;
    } else {
      orgs.push(organization);
    }
    localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));
  },

  getOrganizationById(id: string): Organization | null {
    const orgs = storage.getOrganizations();
    return orgs.find((org) => org.id === id) || null;
  },

  // Users
  getUsers(): User[] {
    return safeParse<User[]>(localStorage.getItem(STORAGE_KEYS.USERS), []);
  },

  saveUser(user: User): void {
    const users = storage.getUsers();
    const existingIndex = users.findIndex((item) => item.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUsersByOrganization(organizationId: string): User[] {
    const users = storage.getUsers();
    return users.filter((u) => u.organizationId === organizationId);
  },

  findUserByEmail(email: string): User | null {
    const users = storage.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Session / Current User
  getCurrentUser(): User | null {
    return safeParse<User | null>(localStorage.getItem(STORAGE_KEYS.CURRENT_USER), null);
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getCurrentOrganization(): Organization | null {
    return safeParse<Organization | null>(localStorage.getItem(STORAGE_KEYS.CURRENT_ORGANIZATION), null);
  },

  setCurrentOrganization(org: Organization | null): void {
    if (org) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ORGANIZATION, JSON.stringify(org));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ORGANIZATION);
    }
  },

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ORGANIZATION);
  },
};

