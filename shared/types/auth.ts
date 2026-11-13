/**
 * Supported user role codes within the system.
 */
export type RoleCode = 'ORGANIZATION' | 'LEADER' | 'DEVELOPER';

/**
 * UI display labels for user roles in Spanish.
 */
export const ROLE_LABELS: Record<RoleCode, string> = {
    ORGANIZATION: 'Organización',
    LEADER: 'Líder Técnico',
    DEVELOPER: 'Desarrollador',
};

/**
 * Represents the ROLES reference table.
 */
export interface Role {
    idRole: number;
    code: RoleCode;
    name: string;
}

/**
 * Represents the USUARIOS entity in the database.
 */
export interface User {
    id: number;
    email: string;
    passwordHash?: string;
    lastPasswordUpdate?: string; // ISO Datetime
    fullName: string;
    role: RoleCode;
    isActive: boolean;
    failedLoginAttempts: number;
    registeredAt: string; // ISO Datetime
}

/**
 * Decoded payload stored inside the JWT token.
 */
export interface JWTPayload {
    sub: number; // User ID
    email: string;
    role: RoleCode;
    iat: number;
    exp: number;
}

/**
 * DTO for initial Organization registration (HU-001).
 */
export interface RegisterOrganizationDTO {
    organizationName: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

/**
 * DTO for user login authentication (HU-002).
 */
export interface LoginCredentialsDTO {
    email: string;
    password: string;
}

/**
 * Backend response payload returned upon successful login or refresh.
 */
export interface AuthTokenResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    user: Omit<User, 'passwordHash'>;
}

/**
 * Active authenticated session structure stored on the client side.
 */
export interface AuthSession {
    user: Omit<User, 'passwordHash'>;
    token: string;
    refreshToken?: string;
    expiresAt: number;
}