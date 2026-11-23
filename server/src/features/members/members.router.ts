import { Router } from 'express';
import { membersController } from './members.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// All member routes require a valid JWT
router.use(authMiddleware);

/**
 * GET  /api/members          – list org members
 * POST /api/members          – create member (HU-003)
 */
router.get('/',  (req, res) => membersController.getMembers(req, res));
router.post('/', (req, res) => membersController.createMember(req, res));

/**
 * PATCH /api/members/:id         – update member data (HU-004)
 * PATCH /api/members/:id/status  – toggle active status (HU-004)
 */
router.patch('/:id',        (req, res) => membersController.updateMember(req, res));
router.patch('/:id/status', (req, res) => membersController.toggleStatus(req, res));

export default router;
