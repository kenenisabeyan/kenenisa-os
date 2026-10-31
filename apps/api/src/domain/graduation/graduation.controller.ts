import type { Request, Response, NextFunction } from 'express';
import { GraduationService } from './graduation.service.js';
import { sendSuccess } from '../../utils/response.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { z } from 'zod';

const updateTargetDateSchema = z.object({
  graduationTargetDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
});

export class GraduationController {
  public static async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = await GraduationService.getGraduationOverview(authReq.user.id);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Graduation Command Center overview retrieved',
        data: { overview: data },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async initializeWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      await GraduationService.ensureGraduationWorkspace(authReq.user.id);
      const data = await GraduationService.getGraduationOverview(authReq.user.id);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Graduation workspace initialized successfully',
        data: { overview: data },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const validated = updateTargetDateSchema.parse(req.body);
      const targetDate =
        validated.graduationTargetDate !== undefined
          ? validated.graduationTargetDate
          : (validated.targetDate ?? null);
      await GraduationService.updateGraduationTargetDate(authReq.user.id, targetDate ?? null);
      const data = await GraduationService.getGraduationOverview(authReq.user.id);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Graduation target settings updated',
        data: { overview: data },
      });
    } catch (error) {
      next(error);
    }
  }
}
