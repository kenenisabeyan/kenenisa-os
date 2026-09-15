import { apiClient } from '../../lib/api-client.js';
import { GoalDto, GoalQuery, createGoalSchema, updateGoalSchema } from '@kenenisa-os/shared';
import { z } from 'zod';

export type CreateGoalInput = z.input<typeof createGoalSchema>;
export type UpdateGoalInput = z.input<typeof updateGoalSchema>;

export async function fetchGoals(query: GoalQuery = {}): Promise<GoalDto[]> {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.pageSize) params.append('pageSize', String(query.pageSize));
  if (query.workstreamId) params.append('workstreamId', query.workstreamId);
  if (query.status) params.append('status', query.status);
  if (query.priority) params.append('priority', query.priority);
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiClient<GoalDto[]>(`/api/v1/goals${queryString}`);
}

export async function createGoal(input: CreateGoalInput): Promise<GoalDto> {
  return apiClient<GoalDto>('/api/v1/goals', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateGoal(id: string, input: UpdateGoalInput): Promise<GoalDto> {
  return apiClient<GoalDto>(`/api/v1/goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function completeGoal(id: string): Promise<GoalDto> {
  return apiClient<GoalDto>(`/api/v1/goals/${id}/complete`, {
    method: 'POST',
  });
}

export async function reopenGoal(id: string): Promise<GoalDto> {
  return apiClient<GoalDto>(`/api/v1/goals/${id}/reopen`, {
    method: 'POST',
  });
}
