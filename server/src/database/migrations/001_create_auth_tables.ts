import { Database } from 'sqlite';

/**
 * Migration 001 – Auth tables
 * Creates ROLES and USUARIOS tables required for HU-001 (register) and HU-002 (login).
 */
export const up = async (db: Database): Promise<void> => {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS ROLES (
            id_role     INTEGER PRIMARY KEY AUTOINCREMENT,
            code        TEXT    NOT NULL UNIQUE,   -- 'ORGANIZATION' | 'LEADER' | 'DEVELOPER'
            name        TEXT    NOT NULL
        );

        INSERT OR IGNORE INTO ROLES (code, name) VALUES
            ('ORGANIZATION', 'Organización'),
            ('LEADER',       'Líder Técnico'),
            ('DEVELOPER',    'Desarrollador');

        CREATE TABLE IF NOT EXISTS USUARIOS (
            id                    INTEGER PRIMARY KEY AUTOINCREMENT,
            email                 TEXT    NOT NULL UNIQUE,
            password_hash         TEXT    NOT NULL,
            last_password_update  TEXT,                           -- ISO-8601 datetime
            full_name             TEXT    NOT NULL,
            id_role               INTEGER NOT NULL REFERENCES ROLES(id_role),
            is_active             INTEGER NOT NULL DEFAULT 1,     -- 0 | 1
            failed_login_attempts INTEGER NOT NULL DEFAULT 0,
            registered_at         TEXT    NOT NULL                -- ISO-8601 datetime
        );
    `);
};
