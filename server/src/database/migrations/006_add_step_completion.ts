import { Database } from 'sqlite';

/**
 * Migration 006 – Step completion support.
 * Adds is_completed column to PASOS table and creates PASOS_COMPLETADOS_EJECUCION table.
 */
export const up = async (db: Database): Promise<void> => {
    // Add is_completed column to PASOS if not already present
    const stepCols = await db.all<{ name: string }[]>("PRAGMA table_info(PASOS)");
    if (!stepCols.some((col) => col.name === 'is_completed')) {
        await db.exec(`ALTER TABLE PASOS ADD COLUMN is_completed INTEGER NOT NULL DEFAULT 0;`);
    }

    // Create PASOS_COMPLETADOS_EJECUCION table for tracking completed steps per execution
    await db.exec(`
        CREATE TABLE IF NOT EXISTS PASOS_COMPLETADOS_EJECUCION (
            id_execution INTEGER NOT NULL,
            id_step      INTEGER NOT NULL,
            completed_at TEXT NOT NULL,
            PRIMARY KEY (id_execution, id_step),
            FOREIGN KEY (id_execution) REFERENCES EJECUCIONES(id) ON DELETE CASCADE,
            FOREIGN KEY (id_step)      REFERENCES PASOS(id_element) ON DELETE CASCADE
        );
    `);
};
