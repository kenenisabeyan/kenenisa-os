import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../../domain/auth/auth.routes.js';

export const v1Router = Router();

v1Router.use('/', healthRouter);
v1Router.use('/auth', authRouter);
