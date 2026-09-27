import { apiClient } from '../../lib/api-client.js';
import {
  DailyPlanDto,
  TimeBlockDto,
  WeeklyPlanDto,
  DailyCapacityDto,
  WeeklyCapacityDto,
  DailyPlanningResponseDto,
  WeeklyPlanningResponseDto,
  YearPlanDto,
  MonthPlanDto,
  PlanOutcomeDto,
  MultiHorizonOverviewDto,
  PlanOutcomeState,
  OutcomeVerificationState,
  createDailyPlanSchema,
  updateDailyPlanSchema,
  createTimeBlockSchema,
  updateTimeBlockSchema,
  createWeeklyPlanSchema,
  updateWeeklyPlanSchema,
  createYearPlanSchema,
  updateYearPlanSchema,
  createMonthPlanSchema,
  updateMonthPlanSchema,
  createPlanOutcomeSchema,
  updatePlanOutcomeSchema,
} from '@kenenisa-os/shared';
import { z } from 'zod';

export type CreateDailyPlanInput = z.input<typeof createDailyPlanSchema>;
export type UpdateDailyPlanInput = z.input<typeof updateDailyPlanSchema>;
export type CreateTimeBlockInput = z.input<typeof createTimeBlockSchema>;
export type UpdateTimeBlockInput = z.input<typeof updateTimeBlockSchema>;
export type CreateWeeklyPlanInput = z.input<typeof createWeeklyPlanSchema>;
export type UpdateWeeklyPlanInput = z.input<typeof updateWeeklyPlanSchema>;
export type CreateYearPlanInput = z.input<typeof createYearPlanSchema>;
export type UpdateYearPlanInput = z.input<typeof updateYearPlanSchema>;
export type CreateMonthPlanInput = z.input<typeof createMonthPlanSchema>;
export type UpdateMonthPlanInput = z.input<typeof updateMonthPlanSchema>;
export type CreatePlanOutcomeInput = z.input<typeof createPlanOutcomeSchema>;
export type UpdatePlanOutcomeInput = z.input<typeof updatePlanOutcomeSchema>;

// ── Multi-Horizon Overview & Summaries ──────────────────────────────────────

export async function fetchMultiHorizonOverview(date?: string): Promise<MultiHorizonOverviewDto> {
  const queryString = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiClient<MultiHorizonOverviewDto>(`/api/v1/planning/overview${queryString}`);
}

export async function fetchDailyFactualSummary(date?: string): Promise<{ summary: string }> {
  const datePath = date ? `/${date}` : '';
  return apiClient<{ summary: string }>(`/api/v1/planning/summary/daily${datePath}`);
}

// ── Yearly Plans ─────────────────────────────────────────────────────────────

export async function fetchYearPlans(): Promise<YearPlanDto[]> {
  return apiClient<YearPlanDto[]>('/api/v1/planning/year');
}

export async function fetchYearPlan(year: number): Promise<YearPlanDto | null> {
  return apiClient<YearPlanDto | null>(`/api/v1/planning/year/${year}`);
}

export async function createYearPlan(input: CreateYearPlanInput): Promise<YearPlanDto> {
  return apiClient<YearPlanDto>('/api/v1/planning/year', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateYearPlan(year: number, input: UpdateYearPlanInput): Promise<YearPlanDto> {
  return apiClient<YearPlanDto>(`/api/v1/planning/year/${year}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// ── Monthly Plans ────────────────────────────────────────────────────────────

export async function fetchMonthPlans(year?: number): Promise<MonthPlanDto[]> {
  const queryString = year ? `?year=${year}` : '';
  return apiClient<MonthPlanDto[]>(`/api/v1/planning/month${queryString}`);
}

export async function fetchMonthPlan(year: number, month: number): Promise<MonthPlanDto | null> {
  return apiClient<MonthPlanDto | null>(`/api/v1/planning/month/${year}/${month}`);
}

export async function createMonthPlan(input: CreateMonthPlanInput): Promise<MonthPlanDto> {
  return apiClient<MonthPlanDto>('/api/v1/planning/month', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateMonthPlan(year: number, month: number, input: UpdateMonthPlanInput): Promise<MonthPlanDto> {
  return apiClient<MonthPlanDto>(`/api/v1/planning/month/${year}/${month}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// ── Plan Outcomes Engine ─────────────────────────────────────────────────────

export async function fetchOutcomes(params: {
  horizon?: string;
  yearPlanId?: string;
  monthPlanId?: string;
  weeklyPlanId?: string;
  dailyPlanId?: string;
  outcomeState?: string;
} = {}): Promise<PlanOutcomeDto[]> {
  const query = new URLSearchParams();
  if (params.horizon) query.append('horizon', params.horizon);
  if (params.yearPlanId) query.append('yearPlanId', params.yearPlanId);
  if (params.monthPlanId) query.append('monthPlanId', params.monthPlanId);
  if (params.weeklyPlanId) query.append('weeklyPlanId', params.weeklyPlanId);
  if (params.dailyPlanId) query.append('dailyPlanId', params.dailyPlanId);
  if (params.outcomeState) query.append('outcomeState', params.outcomeState);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiClient<PlanOutcomeDto[]>(`/api/v1/planning/outcomes${queryString}`);
}

export async function createOutcome(input: CreatePlanOutcomeInput): Promise<PlanOutcomeDto> {
  return apiClient<PlanOutcomeDto>('/api/v1/planning/outcomes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateOutcome(id: string, input: UpdatePlanOutcomeInput): Promise<PlanOutcomeDto> {
  return apiClient<PlanOutcomeDto>(`/api/v1/planning/outcomes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteOutcome(id: string): Promise<boolean> {
  await apiClient<{ success: boolean }>(`/api/v1/planning/outcomes/${id}`, {
    method: 'DELETE',
  });
  return true;
}

export async function confirmOutcome(
  id: string,
  outcomeState: PlanOutcomeState,
  actualResult?: string,
  userExplanation?: string,
): Promise<PlanOutcomeDto> {
  return apiClient<PlanOutcomeDto>(`/api/v1/planning/outcomes/${id}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ outcomeState, actualResult, userExplanation }),
  });
}

export async function linkOutcomeEvidence(
  id: string,
  evidenceId: string,
  verificationState: OutcomeVerificationState = 'OBSERVED',
): Promise<PlanOutcomeDto> {
  return apiClient<PlanOutcomeDto>(`/api/v1/planning/outcomes/${id}/evidence`, {
    method: 'POST',
    body: JSON.stringify({ evidenceId, verificationState }),
  });
}

// ── Daily Plans & Time Blocks ────────────────────────────────────────────────

export async function fetchDailyPlanningOverview(date?: string): Promise<DailyPlanningResponseDto> {
  const queryString = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiClient<DailyPlanningResponseDto>(`/api/v1/planning/daily${queryString}`);
}

export async function createDailyPlan(input: CreateDailyPlanInput): Promise<DailyPlanDto> {
  return apiClient<DailyPlanDto>('/api/v1/planning/daily', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateDailyPlan(date: string, input: UpdateDailyPlanInput): Promise<DailyPlanDto> {
  return apiClient<DailyPlanDto>(`/api/v1/planning/daily/${date}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function fetchTimeBlocks(params: { date?: string; taskId?: string; dailyPlanId?: string } = {}): Promise<TimeBlockDto[]> {
  const query = new URLSearchParams();
  if (params.date) query.append('date', params.date);
  if (params.taskId) query.append('taskId', params.taskId);
  if (params.dailyPlanId) query.append('dailyPlanId', params.dailyPlanId);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiClient<TimeBlockDto[]>(`/api/v1/planning/time-blocks${queryString}`);
}

export async function createTimeBlock(input: CreateTimeBlockInput): Promise<TimeBlockDto> {
  return apiClient<TimeBlockDto>('/api/v1/planning/time-blocks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateTimeBlock(id: string, input: UpdateTimeBlockInput): Promise<TimeBlockDto> {
  return apiClient<TimeBlockDto>(`/api/v1/planning/time-blocks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteTimeBlock(id: string): Promise<boolean> {
  await apiClient<{ success: boolean }>(`/api/v1/planning/time-blocks/${id}`, {
    method: 'DELETE',
  });
  return true;
}

export async function fetchDailyCapacity(date?: string): Promise<DailyCapacityDto> {
  const queryString = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiClient<DailyCapacityDto>(`/api/v1/planning/capacity/daily${queryString}`);
}

export async function fetchWeeklyCapacity(weekStart?: string): Promise<WeeklyCapacityDto> {
  const queryString = weekStart ? `?weekStart=${encodeURIComponent(weekStart)}` : '';
  return apiClient<WeeklyCapacityDto>(`/api/v1/planning/capacity/weekly${queryString}`);
}

export async function fetchWeeklyPlanningOverview(weekStart?: string): Promise<WeeklyPlanningResponseDto> {
  const queryString = weekStart ? `?weekStart=${encodeURIComponent(weekStart)}` : '';
  return apiClient<WeeklyPlanningResponseDto>(`/api/v1/planning/weekly${queryString}`);
}

export async function createWeeklyPlan(input: CreateWeeklyPlanInput): Promise<WeeklyPlanDto> {
  return apiClient<WeeklyPlanDto>('/api/v1/planning/weekly', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateWeeklyPlan(weekStart: string, input: UpdateWeeklyPlanInput): Promise<WeeklyPlanDto> {
  return apiClient<WeeklyPlanDto>(`/api/v1/planning/weekly/${weekStart}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
