import { describe, it, expect, vi } from 'vitest';
import {
  fetchEvidenceList,
  createEvidence,
  linkEvidenceTask,
  deleteEvidence,
} from '../evidence/api.js';

vi.mock('../../lib/api-client.js', () => ({
  apiClient: vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (url.includes('/tasks') && init?.method === 'POST') {
      return Promise.resolve({
        id: 'ev-1',
        title: 'Step 8 Implementation',
        tasks: [{ id: 'link-1', evidenceId: 'ev-1', taskId: 'task-1' }],
      });
    }
    if (url.includes('/api/v1/evidence') && (!init || init.method === 'GET')) {
      return Promise.resolve([
        {
          id: 'ev-1',
          userId: 'user-1',
          title: 'Step 8 Implementation',
          type: 'PROJECT',
          date: '2026-09-16',
          verified: false,
          createdAt: '2026-09-16T00:00:00.000Z',
          updatedAt: '2026-09-16T00:00:00.000Z',
        },
      ]);
    }
    if (url.includes('/api/v1/evidence') && init?.method === 'POST') {
      return Promise.resolve({
        id: 'ev-2',
        title: 'New Evidence',
        type: 'GIT_COMMIT',
        date: '2026-09-16',
        verified: false,
      });
    }
    if (init?.method === 'DELETE') {
      return Promise.resolve({ deleted: true });
    }
    return Promise.resolve({});
  }),
}));

describe('Frontend Evidence API Client', () => {
  it('fetches evidence list correctly', async () => {
    const list = await fetchEvidenceList({ type: 'PROJECT' });
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Step 8 Implementation');
  });

  it('creates evidence record correctly', async () => {
    const created = await createEvidence({ title: 'New Evidence', type: 'GIT_COMMIT' });
    expect(created.id).toBe('ev-2');
  });

  it('links task to evidence correctly', async () => {
    const updated = await linkEvidenceTask('ev-1', 'task-1');
    expect(updated.tasks).toHaveLength(1);
  });

  it('deletes evidence record correctly', async () => {
    const result = await deleteEvidence('ev-1');
    expect(result.deleted).toBe(true);
  });
});
