import { Router } from 'express';
import { IntegrationController } from './integration.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const integrationRouter = Router();

integrationRouter.use(requireAuth);

integrationRouter.get('/', (req, res, next) => IntegrationController.getAccounts(req, res, next));
integrationRouter.post('/connect', (req, res, next) => IntegrationController.connectAccount(req, res, next));
integrationRouter.post('/sync-all', (req, res, next) => IntegrationController.syncAll(req, res, next));
integrationRouter.get('/logs', (req, res, next) => IntegrationController.getLogs(req, res, next));
integrationRouter.post('/:provider/sync', (req, res, next) => IntegrationController.syncAccount(req, res, next));
integrationRouter.post('/:provider/disconnect', (req, res, next) => IntegrationController.disconnectAccount(req, res, next));

