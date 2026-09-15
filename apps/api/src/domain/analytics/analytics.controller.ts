import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { analyticsQuerySchema } from '@kenenisa-os/shared';

export class AnalyticsController {
  private service = new AnalyticsService();

  getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getOverview(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getExecutionTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getExecutionTrend(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getProjectAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getGoalAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getWorkstreams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getWorkstreamAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getPlanning = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getPlanningAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getCapacity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getCapacityAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getOverdue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getOverdueAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getBlocked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getBlockedAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getLearning = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getLearningAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getLearningTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getLearningTrend(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getSkillAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getEvidenceAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getEvidenceTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getEvidenceTrend(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getReviewAnalytics(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getWeeklyHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getWeeklyHistory(userId, query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getOpportunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const data = await this.service.getOpportunityAnalytics(userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

