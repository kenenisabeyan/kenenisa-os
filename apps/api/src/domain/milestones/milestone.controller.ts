import { Request, Response, NextFunction } from 'express';
import { MilestoneService } from './milestone.service.js';
import {
  createMilestoneSchema,
  updateMilestoneSchema,
  milestoneQuerySchema,
  reorderMilestonesSchema,
} from '@kenenisa-os/shared';
import { sendSuccess } from '../../utils/response.js';

const service = new MilestoneService();

export async function listMilestonesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const query = milestoneQuerySchema.parse(req.query);
    const items = await service.listMilestones(userId, query);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Milestones retrieved successfully',
      data: items,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMilestoneHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const item = await service.getMilestoneById(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Milestone retrieved successfully',
      data: item,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createMilestoneHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const body = createMilestoneSchema.parse(req.body);
    const created = await service.createMilestone(userId, body);

    return sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Milestone created successfully',
      data: created,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMilestoneHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const body = updateMilestoneSchema.parse(req.body);
    const updated = await service.updateMilestone(id, userId, body);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Milestone updated successfully',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

export async function completeMilestoneHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const completed = await service.completeMilestone(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Milestone marked as complete',
      data: completed,
    });
  } catch (error) {
    return next(error);
  }
}

export async function reopenMilestoneHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const reopened = await service.reopenMilestone(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Milestone reopened',
      data: reopened,
    });
  } catch (error) {
    return next(error);
  }
}

export async function reorderMilestonesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const { items } = reorderMilestonesSchema.parse(req.body);
    const result = await service.reorderMilestones(userId, items);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Milestones reordered successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}
