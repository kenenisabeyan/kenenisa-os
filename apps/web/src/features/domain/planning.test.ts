import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchDailyPlanningOverview,
  fetchWeeklyPlanningOverview,
  createTimeBlock,
} from '../planning/api.js';
import { apiClient } from '../../lib/api-client.js';

vi.mock('../../lib/api-client.js', () => ({
  apiClient: vi.fn(),
}));

describe('Frontend Planning & Capacity Engine API Client Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchDailyPlanningOverview formats date query parameter correctly', async () => {
    const mockDailyData = {
      date: '2026-09-16',
      plan: null,
      mustWinTask: null,
      timeBlocks: [],
      capacity: { date: '2026-09-16', capacityMinutes: 480, plannedMinutes: 0, remainingMinutes: 480, utilizationPercent: 0, overCapacity: false },
      conflicts: [],
      unscheduledReadyTasks: [],
    };

    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockDailyData);

    const res = await fetchDailyPlanningOverview('2026-09-16');
    expect(apiClient).toHaveBeenCalledWith('/api/v1/planning/daily?date=2026-09-16');
    expect(res).toBe(mockDailyData);
  });

  it('createTimeBlock posts time block payload to /api/v1/planning/time-blocks', async () => {
    const mockBlock = { id: 'tb-1', title: 'Deep Work Session' };
    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlock);

    const input = {
      title: 'Deep Work Session',
      startAt: '2026-09-16T09:00:00.000Z',
      endAt: '2026-09-16T11:00:00.000Z',
    };

    const res = await createTimeBlock(input);
    expect(apiClient).toHaveBeenCalledWith('/api/v1/planning/time-blocks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    expect(res).toBe(mockBlock);
  });

  it('fetchWeeklyPlanningOverview formats weekStart query parameter correctly', async () => {
    const mockWeeklyData = {
      weekStart: '2026-09-14',
      weekEnd: '2026-09-20',
      plan: null,
      capacity: { weekStart: '2026-09-14', capacityMinutes: 2400, plannedMinutes: 0 },
      dailyPlans: [],
      unscheduledReadyTasks: [],
    };

    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockWeeklyData);

    const res = await fetchWeeklyPlanningOverview('2026-09-14');
    expect(apiClient).toHaveBeenCalledWith('/api/v1/planning/weekly?weekStart=2026-09-14');
    expect(res).toBe(mockWeeklyData);
  });
});
