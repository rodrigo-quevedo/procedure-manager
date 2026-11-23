import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

/**
 * POST /api/auth/register  – HU-001: Registrar organización
 * POST /api/auth/login     – HU-002: Iniciar sesión
 */
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login',    (req, res) => authController.login(req, res));

export default router;
