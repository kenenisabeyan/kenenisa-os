import { Request, Response, NextFunction } from 'express';
import { LearningService } from './learning.service.js';
import { SkillService } from '../skills/skill.service.js';
import {
  createLearningItemSchema,
  updateLearningItemSchema,
  learningItemQuerySchema,
  recordLearningActivitySchema,
  linkLearningSkillSchema,
  createSkillSchema,
  updateSkillSchema,
  skillQuerySchema,
} from '@kenenisa-os/shared';

export class LearningController {
  private learningService = new LearningService();
  private skillService = new SkillService();

  // ── Skills Endpoints ───────────────────────────────────────────────────────

  listSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = skillQuerySchema.parse(req.query);
      const result = await this.skillService.listSkills(userId, query);
      res.json({
        success: true,
        data: result.items,
        meta: { total: result.total, page: result.page, pageSize: result.pageSize },
      });
    } catch (error) {
      next(error);
    }
  };

  getSkillById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const item = await this.skillService.getSkillById(id, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  createSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const body = createSkillSchema.parse(req.body);
      const item = await this.skillService.createSkill(userId, body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  updateSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const body = updateSkillSchema.parse(req.body);
      const item = await this.skillService.updateSkill(id, userId, body);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  archiveSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const item = await this.skillService.archiveSkill(id, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  // ── Learning Items Endpoints ───────────────────────────────────────────────

  listLearningItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = learningItemQuerySchema.parse(req.query);
      const result = await this.learningService.listLearningItems(userId, query);
      res.json({
        success: true,
        data: result.items,
        meta: { total: result.total, page: result.page, pageSize: result.pageSize },
      });
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const metrics = await this.learningService.getMetrics(userId);
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  };

  getLearningItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const item = await this.learningService.getLearningItemById(id, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  createLearningItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const body = createLearningItemSchema.parse(req.body);
      const item = await this.learningService.createLearningItem(userId, body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  updateLearningItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const body = updateLearningItemSchema.parse(req.body);
      const item = await this.learningService.updateLearningItem(id, userId, body);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  startLearningItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const item = await this.learningService.startLearningItem(id, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  pauseLearningItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const item = await this.learningService.pauseLearningItem(id, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  completeLearningItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const item = await this.learningService.completeLearningItem(id, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  reopenLearningItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const item = await this.learningService.reopenLearningItem(id, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  recordActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const body = recordLearningActivitySchema.parse(req.body);
      const activity = await this.learningService.recordActivity(id, userId, body);
      res.status(201).json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  };

  linkSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const body = linkLearningSkillSchema.parse(req.body);
      const link = await this.learningService.linkSkill(id, userId, body);
      res.status(201).json({ success: true, data: link });
    } catch (error) {
      next(error);
    }
  };

  unlinkSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const skillId = req.params.skillId as string;
      await this.learningService.unlinkSkill(id, userId, skillId);
      res.json({ success: true, data: { message: 'Skill unlinked successfully' } });
    } catch (error) {
      next(error);
    }
  };
}
