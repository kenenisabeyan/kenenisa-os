import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service.js';
import {
  createWeeklyReviewSchema,
  updateWeeklyReviewSchema,
  weeklyReviewQuerySchema,
} from '@kenenisa-os/shared';

export class ReviewController {
  private service = new ReviewService();

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = weeklyReviewQuerySchema.parse(req.query);
      const result = await this.service.listWeeklyReviews(userId, query);
      res.json({
        success: true,
        data: result.items,
        meta: { total: result.total, page: result.page, pageSize: result.pageSize },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const item = await this.service.getWeeklyReviewById(id, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  getContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const weekStart = req.query.weekStart as string | undefined;
      const context = await this.service.getWeeklyReviewContext(userId, weekStart);
      res.json({ success: true, data: context });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const input = createWeeklyReviewSchema.parse(req.body);
      const created = await this.service.createWeeklyReview(userId, input);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const input = updateWeeklyReviewSchema.parse(req.body);
      const updated = await this.service.updateWeeklyReview(id, userId, input);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const updated = await this.service.completeWeeklyReview(id, userId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  reopen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const updated = await this.service.reopenWeeklyReview(id, userId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };
}
