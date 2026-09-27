import { YearPlanService } from './year-plan.service.js';
import { MonthPlanService } from './month-plan.service.js';
import { WeeklyPlanService } from './weekly-plan.service.js';
import { DailyPlanService } from './daily-plan.service.js';
import { OutcomeTrackingService } from './outcome-tracking.service.js';
import type { MultiHorizonOverviewDto } from '@kenenisa-os/shared';
import { PlanOutcomeState } from '@prisma/client';

const yearPlanService = new YearPlanService();
const monthPlanService = new MonthPlanService();
const weeklyPlanService = new WeeklyPlanService();
const dailyPlanService = new DailyPlanService();
const outcomeService = new OutcomeTrackingService();

export class MultiHorizonService {
  /**
   * Builds the consolidated Multi-Horizon Overview across Year, Month, Week, Day.
   */
  public async getMultiHorizonOverview(userId: string, dateStr?: string): Promise<MultiHorizonOverviewDto> {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const year = targetDate.getUTCFullYear();
    const month = targetDate.getUTCMonth() + 1;

    // Fetch active horizon plans
    const activeYearPlan = await yearPlanService.getYearPlan(userId, year);
    const activeMonthPlan = await monthPlanService.getMonthPlan(userId, year, month);

    // Format YYYY-MM-DD
    const isoDateStr = targetDate.toISOString().split('T')[0];
    const dailyOverview = await dailyPlanService.getDailyPlanningOverview(userId, isoDateStr);
    const weeklyOverview = await weeklyPlanService.getWeeklyPlanningOverview(userId, isoDateStr);

    // Fetch all outcomes for user
    const outcomes = await outcomeService.listOutcomes(userId);

    // Compute today summary
    const todayOutcomes = outcomes.filter(
      (o) => o.dailyPlanId === dailyOverview.plan?.id || (o.endDate && o.endDate.startsWith(isoDateStr)),
    );

    const totalPlanned = todayOutcomes.length;
    const totalCompleted = todayOutcomes.filter((o) => o.outcomeState === PlanOutcomeState.COMPLETED).length;
    const totalPartial = todayOutcomes.filter((o) => o.outcomeState === PlanOutcomeState.PARTIALLY_COMPLETED).length;
    const totalMissed = todayOutcomes.filter((o) => o.outcomeState === PlanOutcomeState.MISSED).length;
    const totalBlocked = todayOutcomes.filter((o) => o.outcomeState === PlanOutcomeState.BLOCKED).length;

    const scheduledMinutes = dailyOverview.timeBlocks.reduce((acc, tb) => acc + (tb.durationMinutes || 0), 0);
    const actualMinutes = dailyOverview.timeBlocks
      .filter((tb) => tb.status === 'COMPLETED')
      .reduce((acc, tb) => acc + (tb.durationMinutes || 0), 0);

    const upcomingOutcomes = outcomes.filter((o) => o.outcomeState === PlanOutcomeState.PLANNED || o.outcomeState === PlanOutcomeState.IN_PROGRESS).slice(0, 10);
    const blockedOutcomes = outcomes.filter((o) => o.outcomeState === PlanOutcomeState.BLOCKED);
    const missedOutcomes = outcomes.filter((o) => o.outcomeState === PlanOutcomeState.MISSED);

    return {
      activeYearPlan,
      activeMonthPlan,
      activeWeeklyPlan: weeklyOverview.plan,
      activeDailyPlan: dailyOverview.plan,
      todaySummary: {
        totalPlanned,
        totalCompleted,
        totalPartial,
        totalMissed,
        totalBlocked,
        scheduledMinutes,
        actualMinutes,
      },
      upcomingOutcomes,
      blockedOutcomes,
      missedOutcomes,
    };
  }

  /**
   * Generates a factual end-of-day summary string from existing records.
   */
  public async generateDailyFactualSummary(userId: string, dateStr: string): Promise<string> {
    const dailyOverview = await dailyPlanService.getDailyPlanningOverview(userId, dateStr);
    const outcomes = await outcomeService.listOutcomes(userId, {
      dailyPlanId: dailyOverview.plan?.id,
    });

    const plannedCount = outcomes.length;
    const completed = outcomes.filter((o) => o.outcomeState === PlanOutcomeState.COMPLETED);
    const partial = outcomes.filter((o) => o.outcomeState === PlanOutcomeState.PARTIALLY_COMPLETED);
    const missed = outcomes.filter((o) => o.outcomeState === PlanOutcomeState.MISSED);
    const blocked = outcomes.filter((o) => o.outcomeState === PlanOutcomeState.BLOCKED);

    const scheduledMinutes = dailyOverview.timeBlocks.reduce((acc, tb) => acc + (tb.durationMinutes || 0), 0);
    const actualMinutes = dailyOverview.timeBlocks
      .filter((tb) => tb.status === 'COMPLETED')
      .reduce((acc, tb) => acc + (tb.durationMinutes || 0), 0);

    let summary = `DAILY RESULT (${dateStr})\n\n`;
    summary += `Planned: ${plannedCount} outcomes\n`;
    summary += `Completed: ${completed.length}\n`;
    summary += `Partially completed: ${partial.length}\n`;
    summary += `Missed: ${missed.length}\n`;
    summary += `Blocked: ${blocked.length}\n\n`;
    summary += `Scheduled time: ${Math.floor(scheduledMinutes / 60)}h ${scheduledMinutes % 60}m\n`;
    summary += `Recorded actual time: ${Math.floor(actualMinutes / 60)}h ${actualMinutes % 60}m\n\n`;

    if (completed.length > 0) {
      summary += `Completed outcomes:\n` + completed.map((c) => `- ${c.title}`).join('\n') + '\n\n';
    }
    if (partial.length > 0) {
      summary += `Partially completed outcomes:\n` + partial.map((p) => `- ${p.title}`).join('\n') + '\n\n';
    }
    if (blocked.length > 0) {
      summary += `Blocked work:\n` + blocked.map((b) => `- ${b.title}`).join('\n') + '\n\n';
    }

    return summary.trim();
  }
}
