import { Router } from 'express';
import { executionsController } from './executions.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * GET   /api/executions          – List executions (optional ?developerId=X)
 * GET   /api/executions/:id      – Get execution details with inputs & evaluations
 * POST  /api/executions          – Create execution
 * PATCH /api/executions/:id/state – Update state
 * POST  /api/executions/:id/inputs – Submit / update field input
 * GET   /api/executions/:id/completed-steps – Get list of completed step IDs
 * POST  /api/executions/:id/steps/:stepId/toggle – Toggle step completion
 */
router.get('/',                            (req, res) => executionsController.getExecutions(req, res));
router.get('/:id/completed-steps',         (req, res) => executionsController.getCompletedSteps(req, res));
router.get('/:id',                         (req, res) => executionsController.getExecutionDetails(req, res));
router.post('/',                           (req, res) => executionsController.createExecution(req, res));
router.patch('/:id/state',                 (req, res) => executionsController.updateState(req, res));
router.post('/:id/inputs',                 (req, res) => executionsController.saveInput(req, res));
router.post('/:id/steps/:stepId/toggle',   (req, res) => executionsController.toggleStepCompleted(req, res));

export default router;
