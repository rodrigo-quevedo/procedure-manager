import { getDb } from '../config/database';
import { up as migration001 } from './migrations/001_create_auth_tables';
import { up as migration002 } from './migrations/002_create_members_table';

/**
 * Runs all pending migrations in order.
 * Called once during server startup before the app starts serving requests.
 */
export const runMigrations = async (): Promise<void> => {
    const db = await getDb();

    await migration001(db);
    await migration002(db);

    console.log('✅ Database migrations applied.');
};
