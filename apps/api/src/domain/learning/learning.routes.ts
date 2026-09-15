import { Router } from 'express';
import { LearningController } from './learning.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const learningRouter = Router();
export const skillRouter = Router();

const controller = new LearningController();

// ── Skills Routes ────────────────────────────────────────────────────────────
skillRouter.use(requireAuth);
skillRouter.get('/', controller.listSkills);
skillRouter.post('/', controller.createSkill);
skillRouter.get('/:id', controller.getSkillById);
skillRouter.patch('/:id', controller.updateSkill);
skillRouter.post('/:id/archive', controller.archiveSkill);

// ── Learning Items Routes ───────────────────────────────────────────────────
learningRouter.use(requireAuth);
learningRouter.get('/items', controller.listLearningItems);
learningRouter.get('/metrics', controller.getMetrics);
learningRouter.post('/items', controller.createLearningItem);
learningRouter.get('/items/:id', controller.getLearningItemById);
learningRouter.patch('/items/:id', controller.updateLearningItem);

learningRouter.post('/items/:id/start', controller.startLearningItem);
learningRouter.post('/items/:id/pause', controller.pauseLearningItem);
learningRouter.post('/items/:id/complete', controller.completeLearningItem);
learningRouter.post('/items/:id/reopen', controller.reopenLearningItem);

learningRouter.post('/items/:id/activities', controller.recordActivity);
learningRouter.post('/items/:id/skills', controller.linkSkill);
learningRouter.delete('/items/:id/skills/:skillId', controller.unlinkSkill);
