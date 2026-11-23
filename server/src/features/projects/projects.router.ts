import { Router } from 'express';
import { projectsController } from './projects.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * GET   /api/projects       – List projects
 * GET   /api/projects/:id   – Get single project detail
 * POST  /api/projects       – Create project (HU-005)
 * PATCH /api/projects/:id   – Update project (HU-006)
 */
router.get('/',     (req, res) => projectsController.getProjects(req, res));
router.get('/:id',  (req, res) => projectsController.getProjectById(req, res));
router.post('/',    (req, res) => projectsController.createProject(req, res));
router.patch('/:id', (req, res) => projectsController.updateProject(req, res));

export default router;
