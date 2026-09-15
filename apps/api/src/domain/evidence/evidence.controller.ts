import { Request, Response, NextFunction } from 'express';
import { EvidenceService } from './evidence.service.js';
import {
  createEvidenceSchema,
  updateEvidenceSchema,
  evidenceQuerySchema,
  linkEvidenceTaskSchema,
  linkEvidenceProjectSchema,
  linkEvidenceLearningSchema,
  linkEvidenceSkillSchema,
} from '@kenenisa-os/shared';

export class EvidenceController {
  private service = new EvidenceService();

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const query = evidenceQuerySchema.parse(req.query);
      const result = await this.service.listEvidence(userId, query);
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
      const item = await this.service.getEvidenceById(id, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const input = createEvidenceSchema.parse(req.body);
      const created = await this.service.createEvidence(userId, input);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const input = updateEvidenceSchema.parse(req.body);
      const updated = await this.service.updateEvidence(id, userId, input);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      await this.service.deleteEvidence(id, userId);
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      next(error);
    }
  };

  linkTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const { taskId } = linkEvidenceTaskSchema.parse(req.body);
      const updated = await this.service.linkTask(id, taskId, userId);
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
      const updated = await this.service.unlinkTask(id, taskId, userId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  linkProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const { projectId } = linkEvidenceProjectSchema.parse(req.body);
      const updated = await this.service.linkProject(id, projectId, userId);
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
      const updated = await this.service.unlinkProject(id, projectId, userId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  linkLearningItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const { learningItemId } = linkEvidenceLearningSchema.parse(req.body);
      const updated = await this.service.linkLearningItem(id, learningItemId, userId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  unlinkLearningItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const learningItemId = req.params.learningItemId as string;
      const updated = await this.service.unlinkLearningItem(id, learningItemId, userId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  linkSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const { skillId } = linkEvidenceSkillSchema.parse(req.body);
      const updated = await this.service.linkSkill(id, skillId, userId);
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
      const updated = await this.service.unlinkSkill(id, skillId, userId);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };
}
