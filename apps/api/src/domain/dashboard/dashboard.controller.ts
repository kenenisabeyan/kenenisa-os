import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';
import { dashboardQuerySchema } from '@kenenisa-os/shared';
import { sendSuccess } from '../../utils/response.js';

const dashboardService = new DashboardService();

export async function getDashboardHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const query = dashboardQuerySchema.parse(req.query);
    const data = await dashboardService.getDashboardData(userId, query);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Command Center dashboard data retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}
