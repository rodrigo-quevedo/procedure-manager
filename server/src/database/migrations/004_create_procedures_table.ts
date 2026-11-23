import { Database } from 'sqlite';

/**
 * Migration 004 – Procedures and traceable hierarchical elements.
 * Creates ELEMENTOS_TRAZABLES, PROCEDIMIENTOS, CATEGORIAS_PROCEDIMIENTO,
 * PASOS, SECCIONES, and CAMPOS tables.
 */
export const up = async (db: Database): Promise<void> => {
    await db.exec(`
        -- Supertype table for traceable elements
        CREATE TABLE IF NOT EXISTS ELEMENTOS_TRAZABLES (
            id_element          INTEGER PRIMARY KEY AUTOINCREMENT,
            id_previous_version INTEGER,
            created_at          TEXT NOT NULL,
            FOREIGN KEY (id_previous_version) REFERENCES ELEMENTOS_TRAZABLES(id_element)
        );

        -- Procedures table
        CREATE TABLE IF NOT EXISTS PROCEDIMIENTOS (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            id_project          INTEGER NOT NULL,
            id_creator          INTEGER NOT NULL,
            id_leader_approver  INTEGER,
            id_previous_version INTEGER,
            state               TEXT NOT NULL CHECK(state IN ('DRAFT', 'DEVIATION', 'PENDING_APPROVAL', 'APPROVED')),
            name                TEXT NOT NULL,
            description         TEXT NOT NULL,
            created_at          TEXT NOT NULL,
            FOREIGN KEY (id_project)          REFERENCES PROYECTOS(id) ON DELETE CASCADE,
            FOREIGN KEY (id_creator)          REFERENCES USUARIOS(id),
            FOREIGN KEY (id_leader_approver)  REFERENCES USUARIOS(id),
            FOREIGN KEY (id_previous_version) REFERENCES PROCEDIMIENTOS(id)
        );

        -- Procedure categories / tags
        CREATE TABLE IF NOT EXISTS CATEGORIAS_PROCEDIMIENTO (
            id_procedure INTEGER NOT NULL,
            name         TEXT NOT NULL,
            PRIMARY KEY (id_procedure, name),
            FOREIGN KEY (id_procedure) REFERENCES PROCEDIMIENTOS(id) ON DELETE CASCADE
        );

        -- Steps (Pasos)
        CREATE TABLE IF NOT EXISTS PASOS (
            id_element   INTEGER PRIMARY KEY,
            id_procedure INTEGER NOT NULL,
            name         TEXT NOT NULL,
            description  TEXT NOT NULL,
            step_order   INTEGER NOT NULL,
            FOREIGN KEY (id_element)   REFERENCES ELEMENTOS_TRAZABLES(id_element) ON DELETE CASCADE,
            FOREIGN KEY (id_procedure) REFERENCES PROCEDIMIENTOS(id) ON DELETE CASCADE
        );

        -- Sections (Secciones)
        CREATE TABLE IF NOT EXISTS SECCIONES (
            id_element  INTEGER PRIMARY KEY,
            id_step     INTEGER NOT NULL,
            name        TEXT NOT NULL,
            description TEXT NOT NULL,
            FOREIGN KEY (id_element) REFERENCES ELEMENTOS_TRAZABLES(id_element) ON DELETE CASCADE,
            FOREIGN KEY (id_step)    REFERENCES PASOS(id_element) ON DELETE CASCADE
        );

        -- Fields (Campos)
        CREATE TABLE IF NOT EXISTS CAMPOS (
            id_element INTEGER PRIMARY KEY,
            id_section INTEGER NOT NULL,
            field_type TEXT NOT NULL CHECK(field_type IN ('TEXT', 'CODE', 'IMAGE')),
            content    TEXT NOT NULL,
            FOREIGN KEY (id_element) REFERENCES ELEMENTOS_TRAZABLES(id_element) ON DELETE CASCADE,
            FOREIGN KEY (id_section) REFERENCES SECCIONES(id_element) ON DELETE CASCADE
        );
    `);
};
