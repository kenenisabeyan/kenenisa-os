import type { Request, Response, NextFunction } from 'express';
import { healthService } from '../services/health.service.js';
import { sendSuccess } from '../utils/response.js';

export class HealthController {
  public getHealth(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = healthService.getHealth();
      sendSuccess({
        res,
        req,
        message: 'KENENISA OS API is healthy',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public getLiveness(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = healthService.getHealth();
      sendSuccess({
        res,
        req,
        message: 'KENENISA OS API service is live',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public getReadiness(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = healthService.getReadiness();
      sendSuccess({
        res,
        req,
        message: 'KENENISA OS API service is ready',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const healthController = new HealthController();
