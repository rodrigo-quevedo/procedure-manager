import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authDAO } from './auth.dao';
import type {
    RegisterOrganizationDTO,
    LoginCredentialsDTO,
    AuthTokenResponse,
    User,
} from '@pm/shared';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET no está configurado en las variables de entorno.');
    return secret;
};

const TOKEN_EXPIRY_SECONDS = 60 * 60 * 8; // 8 hours

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const stripHash = (user: User & { passwordHash?: string }): Omit<User, 'passwordHash'> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user as User & { passwordHash: string };
    return safeUser;
};

const signToken = (user: Omit<User, 'passwordHash'>): string =>
    jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        getJwtSecret(),
        { expiresIn: TOKEN_EXPIRY_SECONDS },
    );

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class AuthService {
    /**
     * HU-001 – Register a new organization with its admin user.
     *
     * Business rules:
     *  - E-mail must be unique.
     *  - Password is hashed with bcrypt before storage.
     *  - The user is assigned the ORGANIZATION role.
     *  - Returns an AuthTokenResponse so the client can open a session.
     */
    async registerOrganization(dto: RegisterOrganizationDTO): Promise<AuthTokenResponse> {
        const email = dto.email.trim().toLowerCase();
        const orgName = dto.organizationName.trim();

        // 1. Duplicate e-mail check
        const taken = await authDAO.emailExists(email);
        if (taken) {
            throw new Error('El correo electrónico ya se encuentra registrado.');
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

        // 3. Persist user
        const userId = await authDAO.createUser({
            email,
            passwordHash,
            fullName: orgName,
            roleCode: 'ORGANIZATION',
        });

        // 4. Fetch the freshly created user (so we have all DB-generated fields)
        const userRow = await authDAO.findById(userId);
        if (!userRow) throw new Error('Error inesperado al crear el usuario.');

        const safeUser = stripHash(userRow);

        return {
            accessToken: signToken(safeUser),
            expiresIn: TOKEN_EXPIRY_SECONDS,
            user: safeUser,
        };
    }

    /**
     * HU-002 – Authenticate an existing user.
     *
     * Business rules:
     *  - Generic error message for unknown e-mail (security: no user enumeration).
     *  - Inactive accounts are rejected immediately.
     *  - Failed attempts are tracked; account is locked at MAX_FAILED_ATTEMPTS.
     *  - Successful login resets the counter.
     *  - Returns an AuthTokenResponse with a signed JWT.
     */
    async login(dto: LoginCredentialsDTO): Promise<AuthTokenResponse> {
        const email = dto.email.trim().toLowerCase();

        // 1. Find user
        const userRow = await authDAO.findByEmail(email);
        if (!userRow) {
            throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
        }

        // 2. Check active status
        if (!userRow.isActive) {
            throw new Error('La cuenta está inhabilitada. Contacta al administrador.');
        }

        // 3. Verify password
        const passwordOk = await bcrypt.compare(dto.password, userRow.passwordHash);
        if (!passwordOk) {
            const attempts = userRow.failedLoginAttempts + 1;
            const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
            await authDAO.updateLoginAttempts(userRow.id, attempts, !shouldLock);

            if (shouldLock) {
                throw new Error('Demasiados intentos fallidos. La cuenta ha sido desactivada. Contacta al administrador.');
            }
            throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
        }

        // 4. Reset counter on success
        await authDAO.resetLoginAttempts(userRow.id);

        const safeUser = stripHash(userRow);

        return {
            accessToken: signToken(safeUser),
            expiresIn: TOKEN_EXPIRY_SECONDS,
            user: safeUser,
        };
    }
}

// Singleton
export const authService = new AuthService();
