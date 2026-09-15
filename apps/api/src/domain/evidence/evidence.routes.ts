import { Router } from 'express';
import { EvidenceController } from './evidence.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
const controller = new EvidenceController();

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

// Task links
router.post('/:id/tasks', controller.linkTask);
router.delete('/:id/tasks/:taskId', controller.unlinkTask);

// Project links
router.post('/:id/projects', controller.linkProject);
router.delete('/:id/projects/:projectId', controller.unlinkProject);

// Learning Item links
router.post('/:id/learning-items', controller.linkLearningItem);
router.delete('/:id/learning-items/:learningItemId', controller.unlinkLearningItem);

// Skill links
router.post('/:id/skills', controller.linkSkill);
router.delete('/:id/skills/:skillId', controller.unlinkSkill);

export default router;
