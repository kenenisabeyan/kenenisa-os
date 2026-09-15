import { Request, Response, NextFunction } from 'express';
import { GoalService } from './goal.service.js';
import { createGoalSchema, updateGoalSchema, goalQuerySchema } from '@kenenisa-os/shared';
import { sendSuccess } from '../../utils/response.js';

const service = new GoalService();

export async function listGoalsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const query = goalQuerySchema.parse(req.query);
    const result = await service.listGoals(userId, query);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Goals retrieved successfully',
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getGoalHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const item = await service.getGoalById(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Goal retrieved successfully',
      data: item,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createGoalHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const body = createGoalSchema.parse(req.body);
    const created = await service.createGoal(userId, body);

    return sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Goal created successfully',
      data: created,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateGoalHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const body = updateGoalSchema.parse(req.body);
    const updated = await service.updateGoal(id, userId, body);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Goal updated successfully',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

export async function completeGoalHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const completed = await service.completeGoal(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Goal marked as complete',
      data: completed,
    });
  } catch (error) {
    return next(error);
  }
}

export async function reopenGoalHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const reopened = await service.reopenGoal(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Goal reopened',
      data: reopened,
    });
  } catch (error) {
    return next(error);
  }
}
