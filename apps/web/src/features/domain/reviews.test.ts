import { describe, it, expect, vi } from 'vitest';
import {
  fetchWeeklyReviews,
  fetchWeeklyReviewContext,
  createWeeklyReview,
  completeWeeklyReview,
} from '../reviews/api.js';

vi.mock('../../lib/api-client.js', () => ({
  apiClient: vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (url.includes('/api/v1/reviews/weekly/context')) {
      return Promise.resolve({
        weekStart: '2026-09-14',
        weekEnd: '2026-09-20',
        completedTasks: 12,
        blockedTasks: 1,
        cancelledTasks: 0,
        plannedMinutes: 2400,
        actualLoggedMinutes: 2400,
        learningMinutes: 480,
        learningItemsCompleted: 2,
        skillsUpdated: 1,
        evidenceCreated: 4,
        activeProjects: 3,
        overCapacityDays: 0,
      });
    }
    if (url.includes('/api/v1/reviews/weekly') && (!init || init.method === 'GET')) {
      return Promise.resolve([
        {
          id: 'rev-1',
          userId: 'user-1',
          status: 'DRAFT',
          wins: 'Great progress',
          createdAt: '2026-09-16T00:00:00.000Z',
          updatedAt: '2026-09-16T00:00:00.000Z',
        },
      ]);
    }
    if (url.includes('/complete') && init?.method === 'POST') {
      return Promise.resolve({
        id: 'rev-1',
        status: 'COMPLETED',
      });
    }
    if (url.includes('/api/v1/reviews/weekly') && init?.method === 'POST') {
      return Promise.resolve({
        id: 'rev-2',
        status: 'DRAFT',
      });
    }
    return Promise.resolve({});
  }),
}));

describe('Frontend Weekly Reviews API Client', () => {
  it('fetches review history correctly', async () => {
    const list = await fetchWeeklyReviews();
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe('DRAFT');
  });

  it('fetches factual weekly context correctly', async () => {
    const context = await fetchWeeklyReviewContext('2026-09-14');
    expect(context.completedTasks).toBe(12);
    expect(context.plannedMinutes).toBe(2400);
  });

  it('creates weekly review correctly', async () => {
    const created = await createWeeklyReview({ wins: 'High velocity' });
    expect(created.id).toBe('rev-2');
  });

  it('completes weekly review correctly', async () => {
    const completed = await completeWeeklyReview('rev-1');
    expect(completed.status).toBe('COMPLETED');
  });
});
