import { apiClient } from '../../lib/api-client.js';
import {
  MilestoneDto,
  MilestoneQuery,
  MilestoneReorderItem,
  createMilestoneSchema,
  updateMilestoneSchema,
} from '@kenenisa-os/shared';
import { z } from 'zod';

export type CreateMilestoneInput = z.input<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.input<typeof updateMilestoneSchema>;

export async function fetchMilestones(query: MilestoneQuery = {}): Promise<MilestoneDto[]> {
  const params = new URLSearchParams();
  if (query.projectId) params.append('projectId', query.projectId);
  if (query.status) params.append('status', query.status);
  if (query.search) params.append('search', query.search);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiClient<MilestoneDto[]>(`/api/v1/milestones${queryString}`);
}

export async function createMilestone(input: CreateMilestoneInput): Promise<MilestoneDto> {
  return apiClient<MilestoneDto>('/api/v1/milestones', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateMilestone(
  id: string,
  input: UpdateMilestoneInput,
): Promise<MilestoneDto> {
  return apiClient<MilestoneDto>(`/api/v1/milestones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function completeMilestone(id: string): Promise<MilestoneDto> {
  return apiClient<MilestoneDto>(`/api/v1/milestones/${id}/complete`, {
    method: 'POST',
  });
}

export async function reopenMilestone(id: string): Promise<MilestoneDto> {
  return apiClient<MilestoneDto>(`/api/v1/milestones/${id}/reopen`, {
    method: 'POST',
  });
}

export async function reorderMilestones(
  items: MilestoneReorderItem[],
): Promise<{ success: boolean; count: number }> {
  return apiClient<{ success: boolean; count: number }>('/api/v1/milestones/reorder', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}
