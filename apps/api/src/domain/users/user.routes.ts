import { Router } from 'express';
import { UserController } from './user.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const userRouter = Router();

// Protect all user management routes for OWNER and ADMIN roles
userRouter.use(requireAuth, requireRole('OWNER', 'ADMIN'));

userRouter.get('/', (req, res, next) => UserController.getAllUsers(req, res, next));
userRouter.get('/:id', (req, res, next) => UserController.getUserById(req, res, next));
userRouter.post('/', (req, res, next) => UserController.createUser(req, res, next));
userRouter.patch('/:id', (req, res, next) => UserController.updateUser(req, res, next));
userRouter.delete('/:id', (req, res, next) => UserController.deleteUser(req, res, next));
