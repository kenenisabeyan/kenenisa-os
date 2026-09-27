import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { ResultsController } from './results.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', ResultsController.getResults);
router.get('/overview', ResultsController.getOverview);
router.get('/trends', ResultsController.getTrends);
router.get('/recommendations', ResultsController.getRecommendations);
router.get('/patterns', ResultsController.getPatterns);
router.get('/analysis', ResultsController.getAnalysis);
router.get('/timeline', ResultsController.getTimeline);
router.get('/comparison', ResultsController.getPeriodComparison);
router.get('/workstreams', ResultsController.getWorkstreamBreakdown);
router.get('/projects', ResultsController.getProjectBreakdown);
router.get('/capacity-analysis', ResultsController.getCapacityAnalysis);
router.get('/export/preview', ResultsController.getExportPreview);
router.get('/export/xlsx', ResultsController.downloadXlsx);

export default router;
