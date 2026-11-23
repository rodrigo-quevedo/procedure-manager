import { Router } from 'express';
import { proceduresController } from './procedures.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * GET   /api/procedures          – List procedures (optional ?projectId=1)
 * GET   /api/procedures/:id      – Get procedure detail with steps, sections and fields
 * POST  /api/procedures          – Save hierarchy (create or update)
 * PATCH /api/procedures/:id/state – Update procedure status (e.g. APPROVED, PENDING_APPROVAL)
 */
router.get('/',           (req, res) => proceduresController.getProcedures(req, res));
router.get('/:id',        (req, res) => proceduresController.getProcedureDetails(req, res));
router.post('/',          (req, res) => proceduresController.saveProcedureHierarchy(req, res));
router.patch('/:id/state', (req, res) => proceduresController.updateState(req, res));

export default router;
