import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './config/database';
import { runMigrations } from './database/migrate';
import { ROLE_LABELS, type RoleCode } from '@pm/shared';
import authRouter from './features/auth/auth.router';
import membersRouter from './features/members/members.router';
import projectsRouter from './features/projects/projects.router';
import proceduresRouter from './features/procedures/procedures.router';
import executionsRouter from './features/procedure_executions/executions.router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Rutas
app.use('/api/auth',        authRouter);
app.use('/api/members',     membersRouter);
app.use('/api/projects',    projectsRouter);
app.use('/api/procedures',  proceduresRouter);
app.use('/api/executions',  executionsRouter);

// Endpoint de verificación (Health Check + prueba de @pm/shared)
app.get('/api/health', async (_req: Request, res: Response) => {
    try {
        const db = await getDb();
        await db.get('SELECT 1');

        const defaultRole: RoleCode = 'ORGANIZATION';

        res.status(200).json({
            status: 'ok',
            database: 'SQLite connected (WAL mode)',
            sharedTypesCheck: {
                roleCode: defaultRole,
                label: ROLE_LABELS[defaultRole],
            },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Database connection failed', error });
    }
});

// Inicializar base de datos y arrancar servidor
const startServer = async () => {
    try {
        await getDb();
        await runMigrations();
        console.log('✅ SQLite database initialized successfully.');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();