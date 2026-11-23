import { Database } from 'sqlite';
import { getDb } from '../../config/database';
import type { User, RoleCode } from '@pm/shared';

// ---------------------------------------------------------------------------
// Raw DB row shapes
// ---------------------------------------------------------------------------

interface UserRow {
    id: number;
    email: string;
    password_hash: string;
    last_password_update: string | null;
    full_name: string;
    id_role: number;
    role_code: RoleCode;
    is_active: number;          // SQLite stores booleans as 0/1
    failed_login_attempts: number;
    registered_at: string;
}

// ---------------------------------------------------------------------------
// Mapping helper
// ---------------------------------------------------------------------------

const rowToUser = (row: UserRow): User & { passwordHash: string } => ({
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    lastPasswordUpdate: row.last_password_update ?? undefined,
    fullName: row.full_name,
    role: row.role_code,
    isActive: row.is_active === 1,
    failedLoginAttempts: row.failed_login_attempts,
    registeredAt: row.registered_at,
});

// ---------------------------------------------------------------------------
// DAO
// ---------------------------------------------------------------------------

export class AuthDAO {
    private db: Database | null = null;

    private async getDb(): Promise<Database> {
        if (!this.db) this.db = await getDb();
        return this.db;
    }

    /** Finds a user by e-mail (case-insensitive). Returns null when not found. */
    async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
        const db = await this.getDb();
        const row = await db.get<UserRow>(
            `SELECT u.*, r.code AS role_code
               FROM USUARIOS u
               JOIN ROLES    r ON r.id_role = u.id_role
              WHERE LOWER(u.email) = LOWER(?)`,
            email,
        );
        return row ? rowToUser(row) : null;
    }

    /** Finds a user by primary key. Returns null when not found. */
    async findById(id: number): Promise<(User & { passwordHash: string }) | null> {
        const db = await this.getDb();
        const row = await db.get<UserRow>(
            `SELECT u.*, r.code AS role_code
               FROM USUARIOS u
               JOIN ROLES    r ON r.id_role = u.id_role
              WHERE u.id = ?`,
            id,
        );
        return row ? rowToUser(row) : null;
    }

    /** Checks whether an e-mail address is already taken. */
    async emailExists(email: string): Promise<boolean> {
        const db = await this.getDb();
        const row = await db.get<{ cnt: number }>(
            `SELECT COUNT(*) AS cnt FROM USUARIOS WHERE LOWER(email) = LOWER(?)`,
            email,
        );
        return (row?.cnt ?? 0) > 0;
    }

    /**
     * Inserts a new user record.
     * @returns the auto-generated numeric ID.
     */
    async createUser(data: {
        email: string;
        passwordHash: string;
        fullName: string;
        roleCode: RoleCode;
    }): Promise<number> {
        const db = await this.getDb();

        const roleRow = await db.get<{ id_role: number }>(
            `SELECT id_role FROM ROLES WHERE code = ?`,
            data.roleCode,
        );
        if (!roleRow) throw new Error(`Rol desconocido: ${data.roleCode}`);

        const now = new Date().toISOString();
        const result = await db.run(
            `INSERT INTO USUARIOS (email, password_hash, full_name, id_role, is_active, failed_login_attempts, registered_at)
             VALUES (?, ?, ?, ?, 1, 0, ?)`,
            data.email,
            data.passwordHash,
            data.fullName,
            roleRow.id_role,
            now,
        );

        return result.lastID!;
    }

    /** Updates the failed-login counter and optionally sets is_active = 0. */
    async updateLoginAttempts(userId: number, attempts: number, isActive: boolean): Promise<void> {
        const db = await this.getDb();
        await db.run(
            `UPDATE USUARIOS SET failed_login_attempts = ?, is_active = ? WHERE id = ?`,
            attempts,
            isActive ? 1 : 0,
            userId,
        );
    }

    /** Resets the failed-login counter after a successful login. */
    async resetLoginAttempts(userId: number): Promise<void> {
        const db = await this.getDb();
        await db.run(
            `UPDATE USUARIOS SET failed_login_attempts = 0, is_active = 1 WHERE id = ?`,
            userId,
        );
    }
}

// Singleton instance – import this everywhere inside the auth feature.
export const authDAO = new AuthDAO();
