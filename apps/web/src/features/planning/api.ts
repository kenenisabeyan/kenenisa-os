import { apiClient } from '../../lib/api-client.js';
import {
  DailyPlanDto,
  TimeBlockDto,
  WeeklyPlanDto,
  DailyCapacityDto,
  WeeklyCapacityDto,
  DailyPlanningResponseDto,
  WeeklyPlanningResponseDto,
  createDailyPlanSchema,
  updateDailyPlanSchema,
  createTimeBlockSchema,
  updateTimeBlockSchema,
  createWeeklyPlanSchema,
  updateWeeklyPlanSchema,
} from '@kenenisa-os/shared';
import { z } from 'zod';

export type CreateDailyPlanInput = z.input<typeof createDailyPlanSchema>;
export type UpdateDailyPlanInput = z.input<typeof updateDailyPlanSchema>;
export type CreateTimeBlockInput = z.input<typeof createTimeBlockSchema>;
export type UpdateTimeBlockInput = z.input<typeof updateTimeBlockSchema>;
export type CreateWeeklyPlanInput = z.input<typeof createWeeklyPlanSchema>;
export type UpdateWeeklyPlanInput = z.input<typeof updateWeeklyPlanSchema>;

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
