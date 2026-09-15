import { Request, Response, NextFunction } from 'express';
import { DailyPlanService } from './daily-plan.service.js';
import { TimeBlockService } from './time-block.service.js';
import { WeeklyPlanService } from './weekly-plan.service.js';
import { CapacityService } from './capacity.service.js';
import {
  createDailyPlanSchema,
  updateDailyPlanSchema,
  dailyPlanQuerySchema,
  createTimeBlockSchema,
  updateTimeBlockSchema,
  timeBlockQuerySchema,
  createWeeklyPlanSchema,
  updateWeeklyPlanSchema,
  weeklyPlanQuerySchema,
  capacityQuerySchema,
} from '@kenenisa-os/shared';
import { sendSuccess } from '../../utils/response.js';

const dailyPlanService = new DailyPlanService();
const timeBlockService = new TimeBlockService();
const weeklyPlanService = new WeeklyPlanService();
const capacityService = new CapacityService();

// ── Daily Plan Handlers ───────────────────────────────────────────────────────

export async function getDailyPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const query = dailyPlanQuerySchema.parse(req.query);
    const dateParam = (req.params.date as string | undefined) || query.date;
    const data = await dailyPlanService.getDailyPlanningOverview(userId, dateParam);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Daily plan overview retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createDailyPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const body = createDailyPlanSchema.parse(req.body);
    const data = await dailyPlanService.createDailyPlan(userId, body);

    sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Daily plan created successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDailyPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const dateStr = req.params.date as string;
    const body = updateDailyPlanSchema.parse(req.body);
    const data = await dailyPlanService.updateDailyPlan(userId, dateStr, body);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Daily plan updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// ── Time Block Handlers ───────────────────────────────────────────────────────

export async function listTimeBlocksHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const query = timeBlockQuerySchema.parse(req.query);
    const data = await timeBlockService.getTimeBlocks(userId, {
      date: query.date,
      startUtc: query.from ? new Date(query.from) : undefined,
      endUtc: query.to ? new Date(query.to) : undefined,
      taskId: query.taskId,
      dailyPlanId: query.dailyPlanId,
      status: query.status,
    });

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Time blocks retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTimeBlockHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const data = await timeBlockService.getTimeBlockById(id, userId);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Time block retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTimeBlockHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const body = createTimeBlockSchema.parse(req.body);
    const data = await timeBlockService.createTimeBlock(userId, body);

    sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Time block created successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTimeBlockHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const body = updateTimeBlockSchema.parse(req.body);
    const data = await timeBlockService.updateTimeBlock(id, userId, body);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Time block updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTimeBlockHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    await timeBlockService.deleteTimeBlock(id, userId);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Time block deleted successfully',
      data: { success: true },
    });
  } catch (error) {
    next(error);
  }
}

// ── Capacity Handlers ─────────────────────────────────────────────────────────

export async function getDailyCapacityHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const query = capacityQuerySchema.parse(req.query);
    const data = await capacityService.getDailyCapacity(userId, query.date);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Daily capacity retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWeeklyCapacityHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const query = capacityQuerySchema.parse(req.query);
    const data = await capacityService.getWeeklyCapacity(userId, query.weekStart);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Weekly capacity retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// ── Weekly Plan Handlers ──────────────────────────────────────────────────────

export async function getWeeklyPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const query = weeklyPlanQuerySchema.parse(req.query);
    const weekStartParam = (req.params.weekStart as string | undefined) || query.weekStart;
    const data = await weeklyPlanService.getWeeklyPlanningOverview(userId, weekStartParam);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Weekly plan overview retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createWeeklyPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const body = createWeeklyPlanSchema.parse(req.body);
    const data = await weeklyPlanService.createWeeklyPlan(userId, body);

    sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Weekly plan created successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateWeeklyPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const weekStartStr = req.params.weekStart as string;
    const body = updateWeeklyPlanSchema.parse(req.body);
    const data = await weeklyPlanService.updateWeeklyPlan(userId, weekStartStr, body);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Weekly plan updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}
