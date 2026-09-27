import type { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service.js';
import { sendSuccess } from '../../utils/response.js';
import { createUserSchema, updateUserSchema } from '@kenenisa-os/shared';
import type { AuthenticatedRequest } from '../auth/auth.types.js';

export class UserController {
  /**
   * GET /api/v1/users
   */
  public static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:id
   */
  public static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await UserService.getUserById(id);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'User retrieved successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/users
   */
  public static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedInput = createUserSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      const user = await UserService.createUser(validatedInput, authReq.user.id, ipAddress);

      sendSuccess({
        res,
        req,
        statusCode: 201,
        message: 'User account provisioned successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:id
   */
  public static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const validatedInput = updateUserSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      const user = await UserService.updateUser(id, validatedInput, authReq.user.id, ipAddress);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'User account updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/users/:id
   */
  public static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const ipAddress = req.ip || req.socket.remoteAddress;

      await UserService.deleteUser(id, authReq.user.id, ipAddress);

      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'User account deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
