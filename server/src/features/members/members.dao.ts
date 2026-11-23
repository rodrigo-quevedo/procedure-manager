import { getDb } from '../../config/database';
import type { User, RoleCode, MemberRoleCode } from '@pm/shared';

// ---------------------------------------------------------------------------
// Raw DB row
// ---------------------------------------------------------------------------

interface UserRow {
    id: number;
    email: string;
    password_hash: string;
    last_password_update: string | null;
    full_name: string;
    id_role: number;
    role_code: RoleCode;
    is_active: number;
    failed_login_attempts: number;
    registered_at: string;
}

// ---------------------------------------------------------------------------
// Mapping helper
// ---------------------------------------------------------------------------

type SafeUser = Omit<User, 'passwordHash'>;

const rowToSafeUser = (row: UserRow): SafeUser => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role_code,
    isActive: row.is_active === 1,
    failedLoginAttempts: row.failed_login_attempts,
    registeredAt: row.registered_at,
    lastPasswordUpdate: row.last_password_update ?? undefined,
});

// ---------------------------------------------------------------------------
// DAO
// ---------------------------------------------------------------------------

export class MembersDAO {

    /**
     * Returns all LEADER/DEVELOPER members that belong to the given organization.
     */
    async findByOrganization(organizationId: number): Promise<SafeUser[]> {
        const db = await getDb();
        const rows = await db.all<UserRow[]>(
            `SELECT u.*, r.code AS role_code
               FROM USUARIOS             u
               JOIN ROLES                r  ON r.id_role = u.id_role
               JOIN ORGANIZACION_MIEMBROS om ON om.id_member = u.id
              WHERE om.id_organization = ?
              ORDER BY u.full_name ASC`,
            organizationId,
        );
        return rows.map(rowToSafeUser);
    }

    /**
     * Returns a single member by ID (any role).
     */
    async findById(memberId: number): Promise<SafeUser | null> {
        const db = await getDb();
        const row = await db.get<UserRow>(
            `SELECT u.*, r.code AS role_code
               FROM USUARIOS u
               JOIN ROLES    r ON r.id_role = u.id_role
              WHERE u.id = ?`,
            memberId,
        );
        return row ? rowToSafeUser(row) : null;
    }

    /**
     * Checks whether an e-mail is already taken (by any user other than `excludeId`).
     */
    async emailExists(email: string, excludeId?: number): Promise<boolean> {
        const db = await getDb();
        const row = await db.get<{ cnt: number }>(
            `SELECT COUNT(*) AS cnt
               FROM USUARIOS
              WHERE LOWER(email) = LOWER(?)
                AND id != COALESCE(?, -1)`,
            email,
            excludeId ?? null,
        );
        return (row?.cnt ?? 0) > 0;
    }

    /**
     * Creates a new LEADER/DEVELOPER user and links them to the organization.
     * Returns the auto-generated user ID.
     */
    async createMember(data: {
        organizationId: number;
        email: string;
        passwordHash: string;
        fullName: string;
        roleCode: MemberRoleCode;
    }): Promise<number> {
        const db = await getDb();

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

        const memberId = result.lastID!;

        await db.run(
            `INSERT INTO ORGANIZACION_MIEMBROS (id_organization, id_member, joined_at)
             VALUES (?, ?, ?)`,
            data.organizationId,
            memberId,
            now,
        );

        return memberId;
    }

    /**
     * Partially updates a member's editable fields.
     * Only the provided fields are changed; others are left as-is.
     */
    async updateMember(memberId: number, data: {
        fullName?: string;
        email?: string;
        passwordHash?: string;
        roleCode?: MemberRoleCode;
    }): Promise<void> {
        const db = await getDb();

        if (data.roleCode) {
            const roleRow = await db.get<{ id_role: number }>(
                `SELECT id_role FROM ROLES WHERE code = ?`,
                data.roleCode,
            );
            if (!roleRow) throw new Error(`Rol desconocido: ${data.roleCode}`);

            await db.run(
                `UPDATE USUARIOS SET id_role = ? WHERE id = ?`,
                roleRow.id_role,
                memberId,
            );
        }

        if (data.fullName) {
            await db.run(
                `UPDATE USUARIOS SET full_name = ? WHERE id = ?`,
                data.fullName,
                memberId,
            );
        }

        if (data.email) {
            await db.run(
                `UPDATE USUARIOS SET email = ? WHERE id = ?`,
                data.email,
                memberId,
            );
        }

        if (data.passwordHash) {
            const now = new Date().toISOString();
            await db.run(
                `UPDATE USUARIOS SET password_hash = ?, last_password_update = ? WHERE id = ?`,
                data.passwordHash,
                now,
                memberId,
            );
        }
    }

    /**
     * Toggles the is_active flag and optionally resets the failed-login counter.
     */
    async setActive(memberId: number, isActive: boolean): Promise<void> {
        const db = await getDb();
        await db.run(
            `UPDATE USUARIOS
                SET is_active = ?,
                    failed_login_attempts = CASE WHEN ? = 1 THEN 0 ELSE failed_login_attempts END
              WHERE id = ?`,
            isActive ? 1 : 0,
            isActive ? 1 : 0,
            memberId,
        );
    }

    /**
     * Checks if a user is a member of the given organization.
     */
    async isMemberOf(organizationId: number, memberId: number): Promise<boolean> {
        const db = await getDb();
        const row = await db.get<{ cnt: number }>(
            `SELECT COUNT(*) AS cnt
               FROM ORGANIZACION_MIEMBROS
              WHERE id_organization = ? AND id_member = ?`,
            organizationId,
            memberId,
        );
        return (row?.cnt ?? 0) > 0;
    }
}

export const membersDAO = new MembersDAO();
