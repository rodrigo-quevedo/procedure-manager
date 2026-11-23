import { Database } from 'sqlite';

/**
 * Migration 003 – Projects and project memberships
 * Creates PROYECTOS and MIEMBROS_PROYECTO tables.
 */
export const up = async (db: Database): Promise<void> => {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS PROYECTOS (
            id                    INTEGER PRIMARY KEY AUTOINCREMENT,
            id_organization       INTEGER NOT NULL,
            id_creator            INTEGER NOT NULL,
            confidentiality_level TEXT    NOT NULL CHECK(confidentiality_level IN ('PUBLIC', 'PRIVATE')),
            name                  TEXT    NOT NULL,
            created_at            TEXT    NOT NULL,
            updated_at            TEXT    NOT NULL,
            FOREIGN KEY (id_organization) REFERENCES USUARIOS(id),
            FOREIGN KEY (id_creator)      REFERENCES USUARIOS(id)
        );

        CREATE TABLE IF NOT EXISTS MIEMBROS_PROYECTO (
            id_project  INTEGER NOT NULL,
            id_member   INTEGER NOT NULL,
            assigned_at TEXT    NOT NULL,
            PRIMARY KEY (id_project, id_member),
            FOREIGN KEY (id_project) REFERENCES PROYECTOS(id) ON DELETE CASCADE,
            FOREIGN KEY (id_member)  REFERENCES USUARIOS(id)
        );
    `);
};
