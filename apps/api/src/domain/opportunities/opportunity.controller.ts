import { Request, Response, NextFunction } from 'express';
import { OpportunityStatus } from '@prisma/client';
import { OpportunityService } from './opportunity.service.js';
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  opportunityQuerySchema,
  linkOpportunitySkillSchema,
  linkOpportunityProjectSchema,
  linkOpportunityEvidenceSchema,
  linkOpportunityTaskSchema,
  createOpportunityActivitySchema,
} from '@kenenisa-os/shared';

export class OpportunityController {
  private service = new OpportunityService();

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = opportunityQuerySchema.parse(req.query);
      const result = await this.service.listOpportunities(userId, query);
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
      const item = await this.service.getOpportunityById(id, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const input = createOpportunitySchema.parse(req.body);
      const created = await this.service.createOpportunity(userId, input);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const input = updateOpportunitySchema.parse(req.body);
      const updated = await this.service.updateOpportunity(id, userId, input);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  transitionTo = (targetStatus: OpportunityStatus) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const updated = await this.service.transitionStatus(id, userId, targetStatus);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  linkSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const input = linkOpportunitySkillSchema.parse(req.body);
      const updated = await this.service.linkSkill(id, userId, input.skillId, input.relevance);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  unlinkSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const skillId = req.params.skillId as string;
      const updated = await this.service.unlinkSkill(id, userId, skillId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  linkProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const input = linkOpportunityProjectSchema.parse(req.body);
      const updated = await this.service.linkProject(id, userId, input.projectId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  unlinkProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const projectId = req.params.projectId as string;
      const updated = await this.service.unlinkProject(id, userId, projectId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  linkEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const input = linkOpportunityEvidenceSchema.parse(req.body);
      const updated = await this.service.linkEvidence(id, userId, input.evidenceId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  unlinkEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const evidenceId = req.params.evidenceId as string;
      const updated = await this.service.unlinkEvidence(id, userId, evidenceId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  linkTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const input = linkOpportunityTaskSchema.parse(req.body);
      const updated = await this.service.linkTask(id, userId, input.taskId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  unlinkTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const taskId = req.params.taskId as string;
      const updated = await this.service.unlinkTask(id, userId, taskId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  createActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const input = createOpportunityActivitySchema.parse(req.body);
      const act = await this.service.createActivity(id, userId, input);
      res.status(201).json({ success: true, data: act });
    } catch (error) {
      next(error);
    }
  };

  getFollowUps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const data = await this.service.getFollowUps(userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getDeadlines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const data = await this.service.getDeadlines(userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const data = await this.service.getOpportunityAnalytics(userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
