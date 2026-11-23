import { getDb } from '../config/database';
import { up as migration001 } from './migrations/001_create_auth_tables';

/**
 * Runs all pending migrations in order.
 * Called once during server startup before the app starts serving requests.
 */
export const runMigrations = async (): Promise<void> => {
    const db = await getDb();

    // Simple sequential execution – extend with a migrations table when needed.
    await migration001(db);

    console.log('✅ Database migrations applied.');
};
