import { Router } from 'express';
import { OpportunityController } from './opportunity.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
const controller = new OpportunityController();

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/follow-ups', controller.getFollowUps);
router.get('/deadlines', controller.getDeadlines);

router.get('/:id', controller.getById);
router.patch('/:id', controller.update);

// Status transition endpoints
router.post('/:id/evaluate', controller.transitionTo('EVALUATING'));
router.post('/:id/prepare', controller.transitionTo('PREPARING'));
router.post('/:id/apply', controller.transitionTo('APPLIED'));
router.post('/:id/discuss', controller.transitionTo('IN_DISCUSSION'));
router.post('/:id/interview', controller.transitionTo('INTERVIEW'));
router.post('/:id/offer', controller.transitionTo('OFFERED'));
router.post('/:id/accept', controller.transitionTo('ACCEPTED'));
router.post('/:id/start', controller.transitionTo('ACTIVE'));
router.post('/:id/complete', controller.transitionTo('COMPLETED'));
router.post('/:id/reject', controller.transitionTo('REJECTED'));
router.post('/:id/withdraw', controller.transitionTo('WITHDRAWN'));
router.post('/:id/archive', controller.transitionTo('ARCHIVED'));

// Relationship linkers
router.post('/:id/skills', controller.linkSkill);
router.delete('/:id/skills/:skillId', controller.unlinkSkill);

router.post('/:id/projects', controller.linkProject);
router.delete('/:id/projects/:projectId', controller.unlinkProject);

router.post('/:id/evidence', controller.linkEvidence);
router.delete('/:id/evidence/:evidenceId', controller.unlinkEvidence);

router.post('/:id/tasks', controller.linkTask);
router.delete('/:id/tasks/:taskId', controller.unlinkTask);

// Timeline activities
router.post('/:id/activities', controller.createActivity);

export default router;
export { router as opportunityRouter };
