import { Router } from 'express';
import { ReviewController } from './review.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
const controller = new ReviewController();

router.use(requireAuth);

router.get('/weekly', controller.list);
router.get('/weekly/context', controller.getContext);
router.post('/weekly', controller.create);
router.get('/weekly/:id', controller.getById);
router.patch('/weekly/:id', controller.update);
router.post('/weekly/:id/complete', controller.complete);
router.post('/weekly/:id/reopen', controller.reopen);

export default router;
