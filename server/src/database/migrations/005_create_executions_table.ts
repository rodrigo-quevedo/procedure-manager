import { Database } from 'sqlite';

/**
 * Migration 005 – Procedure executions, inputs, evaluations and corrections.
 * Creates EJECUCIONES, INPUTS, EVALUACIONES, and CORRECCIONES tables.
 */
export const up = async (db: Database): Promise<void> => {
    await db.exec(`
        -- Executions table
        CREATE TABLE IF NOT EXISTS EJECUCIONES (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            id_procedure INTEGER NOT NULL,
            id_project   INTEGER NOT NULL,
            id_developer INTEGER NOT NULL,
            state        TEXT NOT NULL CHECK(state IN ('ACTIVE', 'PAUSED', 'CANCELLED', 'PENDING_EVALUATION', 'HAS_CORRECTIONS', 'APPROVED_FINISHED')),
            started_at   TEXT NOT NULL,
            ended_at     TEXT,
            FOREIGN KEY (id_procedure) REFERENCES PROCEDIMIENTOS(id) ON DELETE CASCADE,
            FOREIGN KEY (id_project)   REFERENCES PROYECTOS(id) ON DELETE CASCADE,
            FOREIGN KEY (id_developer) REFERENCES USUARIOS(id)
        );

        -- Inputs (submitted field values)
        CREATE TABLE IF NOT EXISTS INPUTS (
            id_element   INTEGER PRIMARY KEY,
            id_execution INTEGER NOT NULL,
            id_field     INTEGER NOT NULL,
            field_type   TEXT NOT NULL CHECK(field_type IN ('TEXT', 'CODE', 'IMAGE')),
            content      TEXT NOT NULL,
            created_at   TEXT NOT NULL,
            FOREIGN KEY (id_element)   REFERENCES ELEMENTOS_TRAZABLES(id_element) ON DELETE CASCADE,
            FOREIGN KEY (id_execution) REFERENCES EJECUCIONES(id) ON DELETE CASCADE,
            FOREIGN KEY (id_field)     REFERENCES CAMPOS(id_element) ON DELETE CASCADE
        );

        -- Evaluations (by Leaders)
        CREATE TABLE IF NOT EXISTS EVALUACIONES (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            id_execution INTEGER NOT NULL,
            id_evaluator INTEGER NOT NULL,
            started_at   TEXT NOT NULL,
            ended_at     TEXT,
            FOREIGN KEY (id_execution) REFERENCES EJECUCIONES(id) ON DELETE CASCADE,
            FOREIGN KEY (id_evaluator) REFERENCES USUARIOS(id)
        );

        -- Corrections
        CREATE TABLE IF NOT EXISTS CORRECCIONES (
            id                   INTEGER PRIMARY KEY AUTOINCREMENT,
            id_evaluation        INTEGER NOT NULL,
            id_evaluated_element INTEGER NOT NULL,
            is_direct_edit       INTEGER NOT NULL DEFAULT 0,
            type                 TEXT CHECK(type IN ('TEXT', 'CODE', 'IMAGE')),
            content              TEXT,
            created_at           TEXT NOT NULL,
            FOREIGN KEY (id_evaluation)        REFERENCES EVALUACIONES(id) ON DELETE CASCADE,
            FOREIGN KEY (id_evaluated_element) REFERENCES ELEMENTOS_TRAZABLES(id_element) ON DELETE CASCADE
        );
    `);
};
