import type { Request, Response, NextFunction } from 'express';
import { integrationService } from './integration.service.js';
import { sendSuccess } from '../../utils/response.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { z } from 'zod';
import type { IntegrationProvider } from '@prisma/client';

const connectSchema = z.object({
  provider: z.enum(['GOOGLE_CALENDAR', 'GMAIL', 'GITHUB', 'GOOGLE_DRIVE', 'CUSTOM_WEBHOOK']),
  token: z.string().min(1, 'Token or credential is required'),
  refreshToken: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
});

export class IntegrationController {
  public static async getAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = await integrationService.getAccounts(authReq.user.id);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Integration accounts retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async connectAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const validated = connectSchema.parse(req.body);
      const result = await integrationService.connectAccount(authReq.user.id, {
        provider: validated.provider as IntegrationProvider,
        token: validated.token,
        refreshToken: validated.refreshToken,
        scopes: validated.scopes,
        settings: validated.settings,
      });
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: `Successfully connected and initialized ${validated.provider}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async disconnectAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { provider } = req.params;
      const result = await integrationService.disconnectAccount(authReq.user.id, provider as IntegrationProvider);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: `Successfully disconnected ${provider}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async syncAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { provider } = req.params;
      const result = await integrationService.syncAccount(authReq.user.id, provider as IntegrationProvider);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: `Synchronization completed for ${provider}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async syncAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const results = await integrationService.syncAll(authReq.user.id);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Synchronized all active integrations',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const logs = await integrationService.getSyncLogs(authReq.user.id, limit);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Integration sync logs retrieved successfully',
        data: { logs },
      });
    } catch (error) {
      next(error);
    }
  }
}

