import { apiClient } from '../../lib/api-client.js';
import {
  WorkstreamDto,
  WorkstreamQuery,
  createWorkstreamSchema,
  updateWorkstreamSchema,
} from '@kenenisa-os/shared';
import { z } from 'zod';

export type CreateWorkstreamInput = z.input<typeof createWorkstreamSchema>;
export type UpdateWorkstreamInput = z.input<typeof updateWorkstreamSchema>;

export async function fetchWorkstreams(query: WorkstreamQuery = {}): Promise<WorkstreamDto[]> {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.pageSize) params.append('pageSize', String(query.pageSize));
  if (query.status) params.append('status', query.status);
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiClient<WorkstreamDto[]>(`/api/v1/workstreams${queryString}`);
}

export async function createWorkstream(input: CreateWorkstreamInput): Promise<WorkstreamDto> {
  return apiClient<WorkstreamDto>('/api/v1/workstreams', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateWorkstream(
  id: string,
  input: UpdateWorkstreamInput,
): Promise<WorkstreamDto> {
  return apiClient<WorkstreamDto>(`/api/v1/workstreams/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function archiveWorkstream(id: string): Promise<WorkstreamDto> {
  return apiClient<WorkstreamDto>(`/api/v1/workstreams/${id}/archive`, {
    method: 'POST',
  });
}
