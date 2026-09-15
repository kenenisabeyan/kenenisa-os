import { Router } from 'express';
import { IntelligenceController } from './intelligence.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
const controller = new IntelligenceController();

router.use(requireAuth);

// Core chat & action confirmation
router.post('/chat', controller.chat);
router.post('/actions/confirm', controller.confirmAction);

// Conversations management
router.get('/conversations', controller.listConversations);
router.get('/conversations/:id/messages', controller.getConversationMessages);
router.delete('/conversations/:id', controller.deleteConversation);

// Memory management
router.get('/memory', controller.listMemories);
router.post('/memory', controller.createMemory);
router.patch('/memory/:id', controller.updateMemory);
router.post('/memory/:id/archive', controller.archiveMemory);

export default router;
export { router as intelligenceRouter };
