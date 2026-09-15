import { describe, it, expect, vi } from 'vitest';
import { fetchTasks, createTask, startTask, completeTask, addTaskDependency } from '../tasks/api.js';
import { apiClient } from '../../lib/api-client.js';

vi.mock('../../lib/api-client.js', () => ({
  apiClient: vi.fn(),
}));

describe('Frontend Task Execution API Client Test Suite', () => {
  it('fetchTasks formats query parameters correctly', async () => {
    const mockData = [{ id: 'task-1', title: 'Implement Task API' }];
    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const res = await fetchTasks({ projectId: 'proj-1', status: 'READY', priority: 'P1' });
    expect(apiClient).toHaveBeenCalledWith(
      '/api/v1/tasks?projectId=proj-1&status=READY&priority=P1',
    );
    expect(res).toBe(mockData);
  });

  it('createTask sends POST request to /api/v1/tasks', async () => {
    const mockCreated = { id: 'task-1', title: 'Build Task UI' };
    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreated);

    const input = {
      title: 'Build Task UI',
      projectId: 'proj-1',
      priority: 'P2' as const,
      estimateMinutes: 60,
    };

    const res = await createTask(input);
    expect(apiClient).toHaveBeenCalledWith('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    expect(res).toBe(mockCreated);
  });

  it('startTask calls POST /api/v1/tasks/:id/start', async () => {
    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'task-1', status: 'IN_PROGRESS' });

    await startTask('task-1');
    expect(apiClient).toHaveBeenCalledWith('/api/v1/tasks/task-1/start', {
      method: 'POST',
    });
  });

  it('completeTask calls POST /api/v1/tasks/:id/complete', async () => {
    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'task-1', status: 'DONE' });

    await completeTask('task-1');
    expect(apiClient).toHaveBeenCalledWith('/api/v1/tasks/task-1/complete', {
      method: 'POST',
    });
  });

  it('addTaskDependency calls POST /api/v1/tasks/:id/dependencies', async () => {
    (apiClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'dep-1' });

    await addTaskDependency('task-dependent', { blockingTaskId: 'task-blocking' });
    expect(apiClient).toHaveBeenCalledWith('/api/v1/tasks/task-dependent/dependencies', {
      method: 'POST',
      body: JSON.stringify({ blockingTaskId: 'task-blocking' }),
    });
  });
});
