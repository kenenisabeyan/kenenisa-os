import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
const controller = new AnalyticsController();

router.use(requireAuth);

router.get('/overview', controller.getOverview);
router.get('/execution/trend', controller.getExecutionTrend);
router.get('/projects', controller.getProjects);
router.get('/goals', controller.getGoals);
router.get('/workstreams', controller.getWorkstreams);
router.get('/planning', controller.getPlanning);
router.get('/capacity', controller.getCapacity);
router.get('/overdue', controller.getOverdue);
router.get('/blocked', controller.getBlocked);
router.get('/learning', controller.getLearning);
router.get('/learning/trend', controller.getLearningTrend);
router.get('/skills', controller.getSkills);
router.get('/evidence', controller.getEvidence);
router.get('/evidence/trend', controller.getEvidenceTrend);
router.get('/reviews', controller.getReviews);
router.get('/weekly-history', controller.getWeeklyHistory);
router.get('/opportunities', controller.getOpportunities);

export default router;
export { router as analyticsRouter };
