import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDashboard } from '../dashboard/api.js';
import { apiClient } from '../../lib/api-client.js';

vi.mock('../../lib/api-client.js', () => ({
  apiClient: vi.fn(),
}));

describe('Frontend Command Center Dashboard API Client Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchDashboard sends query params and calls /api/v1/dashboard', async () => {
    const mockDashboardData = {
      summary: { activeWorkstreams: 2, activeGoals: 5, activeProjects: 3, readyTasks: 10 },
      nextBestAction: null,
      today: { date: '2026-09-16', dueToday: [], inProgress: [], ready: [] },
      workstreams: [],
      activeProjects: [],
      blockedTasks: [],
      overdueTasks: [],
      upcomingTasks: [],
      recentActivity: [],
    };

    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockDashboardData);

    const res = await fetchDashboard({ date: '2026-09-16', timezone: 'UTC' });
    expect(apiClient).toHaveBeenCalledWith('/api/v1/dashboard?date=2026-09-16&timezone=UTC');
    expect(res).toBe(mockDashboardData);
  });
});
