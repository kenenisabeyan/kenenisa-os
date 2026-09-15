import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchLearningItems,
  fetchLearningMetrics,
  createLearningItem,
  createSkill,
} from '../learning/api.js';
import { apiClient } from '../../lib/api-client.js';

vi.mock('../../lib/api-client.js', () => ({
  apiClient: vi.fn(),
}));

describe('Frontend Learning & Skills API Client Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchLearningItems calls GET /api/v1/learning/items with search query', async () => {
    (apiClient as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'li-1', title: 'PostgreSQL' },
    ]);

    const items = await fetchLearningItems({ search: 'PostgreSQL' });

    expect(apiClient).toHaveBeenCalledWith('/api/v1/learning/items?search=PostgreSQL');
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('PostgreSQL');
  });

  it('fetchLearningMetrics calls GET /api/v1/learning/metrics', async () => {
    (apiClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      totalItems: 5,
      inProgressItems: 2,
      completedItems: 2,
      totalLoggedMinutes: 300,
      activeSkillsCount: 3,
      linkedProjectsCount: 1,
    });

    const metrics = await fetchLearningMetrics();

    expect(apiClient).toHaveBeenCalledWith('/api/v1/learning/metrics');
    expect(metrics.totalItems).toBe(5);
    expect(metrics.totalLoggedMinutes).toBe(300);
  });

  it('createLearningItem posts payload to /api/v1/learning/items', async () => {
    (apiClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'li-new',
      title: 'System Design',
    });

    const result = await createLearningItem({
      title: 'System Design',
      type: 'COURSE',
    });

    expect(apiClient).toHaveBeenCalledWith('/api/v1/learning/items', {
      method: 'POST',
      body: JSON.stringify({ title: 'System Design', type: 'COURSE' }),
    });
    expect(result.id).toBe('li-new');
  });

  it('createSkill posts payload to /api/v1/skills', async () => {
    (apiClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'skill-1',
      name: 'TypeScript',
    });

    const result = await createSkill({
      name: 'TypeScript',
      category: 'Frontend',
    });

    expect(apiClient).toHaveBeenCalledWith('/api/v1/skills', {
      method: 'POST',
      body: JSON.stringify({ name: 'TypeScript', category: 'Frontend' }),
    });
    expect(result.name).toBe('TypeScript');
  });
});
