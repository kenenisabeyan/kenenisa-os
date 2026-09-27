import { Request, Response, NextFunction } from 'express';
import { DailyPlanService } from './daily-plan.service.js';
import { TimeBlockService } from './time-block.service.js';
import { WeeklyPlanService } from './weekly-plan.service.js';
import { CapacityService } from './capacity.service.js';
import { YearPlanService } from './year-plan.service.js';
import { MonthPlanService } from './month-plan.service.js';
import { OutcomeTrackingService } from './outcome-tracking.service.js';
import { MultiHorizonService } from './multi-horizon.service.js';
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
  createYearPlanSchema,
  updateYearPlanSchema,
  createMonthPlanSchema,
  updateMonthPlanSchema,
  createPlanOutcomeSchema,
  updatePlanOutcomeSchema,
  planOutcomeQuerySchema,
  linkPlanOutcomeEvidenceSchema,
} from '@kenenisa-os/shared';
import { sendSuccess } from '../../utils/response.js';

const dailyPlanService = new DailyPlanService();
const timeBlockService = new TimeBlockService();
const weeklyPlanService = new WeeklyPlanService();
const capacityService = new CapacityService();
const yearPlanService = new YearPlanService();
const monthPlanService = new MonthPlanService();
const outcomeTrackingService = new OutcomeTrackingService();
const multiHorizonService = new MultiHorizonService();

// ── Multi-Horizon Overview Handler ──────────────────────────────────────────

export async function getMultiHorizonOverviewHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const dateStr = req.query.date as string | undefined;
    const data = await multiHorizonService.getMultiHorizonOverview(userId, dateStr);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Multi-Horizon overview retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDailyFactualSummaryHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const dateStr = (req.params.date as string) || new Date().toISOString().split('T')[0];
    const data = await multiHorizonService.generateDailyFactualSummary(userId, dateStr);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Daily factual summary generated successfully',
      data: { summary: data },
    });
  } catch (error) {
    next(error);
  }
}

// ── Year Plan Handlers ────────────────────────────────────────────────────────

export async function listYearPlansHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const data = await yearPlanService.listYearPlans(userId);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Yearly plans retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getYearPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const year = parseInt(req.params.year as string, 10);
    const data = await yearPlanService.getYearPlan(userId, year);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Yearly plan retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createYearPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const body = createYearPlanSchema.parse(req.body);
    const data = await yearPlanService.createYearPlan(userId, body);

    sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Yearly plan created successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateYearPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const year = parseInt(req.params.year as string, 10);
    const body = updateYearPlanSchema.parse(req.body);
    const data = await yearPlanService.updateYearPlan(userId, year, body);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Yearly plan updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// ── Month Plan Handlers ───────────────────────────────────────────────────────

export async function listMonthPlansHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
    const data = await monthPlanService.listMonthPlans(userId, year);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Monthly plans retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMonthPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const year = parseInt(req.params.year as string, 10);
    const month = parseInt(req.params.month as string, 10);
    const data = await monthPlanService.getMonthPlan(userId, year, month);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Monthly plan retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createMonthPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const body = createMonthPlanSchema.parse(req.body);
    const data = await monthPlanService.createMonthPlan(userId, body);

    sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Monthly plan created successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMonthPlanHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const year = parseInt(req.params.year as string, 10);
    const month = parseInt(req.params.month as string, 10);
    const body = updateMonthPlanSchema.parse(req.body);
    const data = await monthPlanService.updateMonthPlan(userId, year, month, body);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Monthly plan updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// ── Outcome Tracking Handlers ────────────────────────────────────────────────

export async function listOutcomesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const query = planOutcomeQuerySchema.parse(req.query);
    const data = await outcomeTrackingService.listOutcomes(userId, query as any);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Plan outcomes retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOutcomeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const body = createPlanOutcomeSchema.parse(req.body);
    const data = await outcomeTrackingService.createOutcome(userId, body as any);

    sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Plan outcome created successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOutcomeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const body = updatePlanOutcomeSchema.parse(req.body);
    const data = await outcomeTrackingService.updateOutcome(userId, id, body as any);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Plan outcome updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOutcomeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    await outcomeTrackingService.deleteOutcome(userId, id);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Plan outcome deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmOutcomeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const { outcomeState, actualResult, userExplanation } = req.body;
    const data = await outcomeTrackingService.confirmUserOutcome(userId, id, outcomeState, actualResult, userExplanation);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Plan outcome user confirmation saved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function linkOutcomeEvidenceHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const body = linkPlanOutcomeEvidenceSchema.parse(req.body);
    const data = await outcomeTrackingService.linkEvidence(userId, id, body.evidenceId, body.verificationState as any);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Evidence linked to outcome successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

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
    const data = await timeBlockService.getTimeBlockById(userId, id);

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
    const data = await timeBlockService.updateTimeBlock(userId, id, body);

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
    await timeBlockService.deleteTimeBlock(userId, id);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Time block deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

// ── Capacity Engine Handlers ─────────────────────────────────────────────────

export async function getDailyCapacityHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.auth!.userId;
    const query = capacityQuerySchema.parse(req.query);
    const data = await capacityService.getDailyCapacity(userId, query.date);

    sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Daily capacity calculated successfully',
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
      message: 'Weekly capacity calculated successfully',
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
