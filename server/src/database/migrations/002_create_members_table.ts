import { Database } from 'sqlite';

/**
 * Migration 002 – No new tables needed for members.
 * Members are stored in USUARIOS (created in migration 001).
 * This migration is a placeholder for any future member-specific schema changes.
 *
 * The relationship between an organization and its members is tracked via
 * the id_role column: members have role LEADER or DEVELOPER and are linked
 * to an organization through the ORGANIZACION_MIEMBROS table created here.
 */
export const up = async (db: Database): Promise<void> => {
    await db.exec(`
        -- Many-to-many: a user (LEADER/DEVELOPER) belongs to exactly one organization.
        -- We store this as a simple FK-style table to keep org membership explicit
        -- without adding a nullable column to USUARIOS.
        CREATE TABLE IF NOT EXISTS ORGANIZACION_MIEMBROS (
            id_organization INTEGER NOT NULL,  -- ID of the ORGANIZATION-role user
            id_member       INTEGER NOT NULL,  -- ID of the LEADER/DEVELOPER-role user
            joined_at       TEXT    NOT NULL,  -- ISO-8601 datetime
            PRIMARY KEY (id_organization, id_member),
            FOREIGN KEY (id_organization) REFERENCES USUARIOS(id),
            FOREIGN KEY (id_member)       REFERENCES USUARIOS(id)
        );
    `);
};
