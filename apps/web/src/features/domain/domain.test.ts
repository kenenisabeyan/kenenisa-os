import { describe, it, expect, vi } from 'vitest';
import { fetchWorkstreams } from '../workstreams/api.js';
import { fetchGoals } from '../goals/api.js';
import { fetchProjects } from '../projects/api.js';
import { fetchMilestones } from '../milestones/api.js';
import { apiClient } from '../../lib/api-client.js';

vi.mock('../../lib/api-client.js', () => ({
  apiClient: vi.fn(),
}));

describe('Frontend Strategic Domain API Clients Test Suite', () => {
  it('fetchWorkstreams builds query parameters and calls apiClient correctly', async () => {
    const mockData = [{ id: 'ws-1', name: 'AI Engineering' }];
    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const res = await fetchWorkstreams({ search: 'AI', status: 'ACTIVE' });
    expect(apiClient).toHaveBeenCalledWith('/api/v1/workstreams?status=ACTIVE&search=AI');
    expect(res).toBe(mockData);
  });

  it('fetchGoals formats query parameters correctly', async () => {
    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'g-1', title: 'Master RAG' }]);

    await fetchGoals({ workstreamId: 'ws-1', status: 'IN_PROGRESS' });
    expect(apiClient).toHaveBeenCalledWith(
      '/api/v1/goals?workstreamId=ws-1&status=IN_PROGRESS',
    );
  });

  it('fetchProjects formats query parameters correctly', async () => {
    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'p-1', name: 'KENENISA OS' }]);

    await fetchProjects({ workstreamId: 'ws-1', priority: 'P0' });
    expect(apiClient).toHaveBeenCalledWith('/api/v1/projects?workstreamId=ws-1&priority=P0');
  });

  it('fetchMilestones formats query parameters correctly', async () => {
    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'm-1', name: 'Database Complete' }]);

    await fetchMilestones({ projectId: 'p-1' });
    expect(apiClient).toHaveBeenCalledWith('/api/v1/milestones?projectId=p-1');
  });
});
