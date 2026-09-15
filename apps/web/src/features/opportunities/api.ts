import { apiClient } from '../../lib/api-client.js';
import type {
  OpportunityDto,
  OpportunityDetailDto,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  OpportunityQuery,
  OpportunityFollowUpsDto,
  OpportunityDeadlinesDto,
  OpportunityAnalyticsDto,
  OpportunityActivityDto,
} from '@kenenisa-os/shared';

export async function fetchOpportunities(query?: OpportunityQuery): Promise<OpportunityDto[]> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', String(query.page));
  if (query?.pageSize) params.append('pageSize', String(query.pageSize));
  if (query?.status) params.append('status', query.status);
  if (query?.type) params.append('type', query.type);
  if (query?.priority) params.append('priority', query.priority);
  if (query?.source) params.append('source', query.source);
  if (query?.remote !== undefined) params.append('remote', String(query.remote));
  if (query?.search) params.append('search', query.search);

  const str = params.toString();
  const queryString = str ? `?${str}` : '';
  return apiClient<OpportunityDto[]>(`/api/v1/opportunities${queryString}`);
}

export async function fetchOpportunityById(id: string): Promise<OpportunityDetailDto> {
  return apiClient<OpportunityDetailDto>(`/api/v1/opportunities/${id}`);
}

export async function createOpportunity(input: CreateOpportunityInput): Promise<OpportunityDto> {
  return apiClient<OpportunityDto>('/api/v1/opportunities', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateOpportunity(id: string, input: UpdateOpportunityInput): Promise<OpportunityDto> {
  return apiClient<OpportunityDto>(`/api/v1/opportunities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function transitionOpportunityStatus(id: string, action: string): Promise<OpportunityDto> {
  return apiClient<OpportunityDto>(`/api/v1/opportunities/${id}/${action}`, {
    method: 'POST',
  });
}

export async function linkOpportunitySkill(id: string, skillId: string, relevance = 'PRIMARY'): Promise<OpportunityDetailDto> {
  return apiClient<OpportunityDetailDto>(`/api/v1/opportunities/${id}/skills`, {
    method: 'POST',
    body: JSON.stringify({ skillId, relevance }),
  });
}

export async function unlinkOpportunitySkill(id: string, skillId: string): Promise<OpportunityDetailDto> {
  return apiClient<OpportunityDetailDto>(`/api/v1/opportunities/${id}/skills/${skillId}`, {
    method: 'DELETE',
  });
}

export async function linkOpportunityProject(id: string, projectId: string): Promise<OpportunityDetailDto> {
  return apiClient<OpportunityDetailDto>(`/api/v1/opportunities/${id}/projects`, {
    method: 'POST',
    body: JSON.stringify({ projectId }),
  });
}

export async function unlinkOpportunityProject(id: string, projectId: string): Promise<OpportunityDetailDto> {
  return apiClient<OpportunityDetailDto>(`/api/v1/opportunities/${id}/projects/${projectId}`, {
    method: 'DELETE',
  });
}

export async function linkOpportunityEvidence(id: string, evidenceId: string): Promise<OpportunityDetailDto> {
  return apiClient<OpportunityDetailDto>(`/api/v1/opportunities/${id}/evidence`, {
    method: 'POST',
    body: JSON.stringify({ evidenceId }),
  });
}

export async function unlinkOpportunityEvidence(id: string, evidenceId: string): Promise<OpportunityDetailDto> {
  return apiClient<OpportunityDetailDto>(`/api/v1/opportunities/${id}/evidence/${evidenceId}`, {
    method: 'DELETE',
  });
}

export async function linkOpportunityTask(id: string, taskId: string): Promise<OpportunityDetailDto> {
  return apiClient<OpportunityDetailDto>(`/api/v1/opportunities/${id}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ taskId }),
  });
}

export async function unlinkOpportunityTask(id: string, taskId: string): Promise<OpportunityDetailDto> {
  return apiClient<OpportunityDetailDto>(`/api/v1/opportunities/${id}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export async function createOpportunityActivity(
  id: string,
  input: { type?: string; title: string; description?: string | null; occurredAt?: string }
): Promise<OpportunityActivityDto> {
  return apiClient<OpportunityActivityDto>(`/api/v1/opportunities/${id}/activities`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchOpportunityFollowUps(): Promise<OpportunityFollowUpsDto> {
  return apiClient<OpportunityFollowUpsDto>('/api/v1/opportunities/follow-ups');
}

export async function fetchOpportunityDeadlines(): Promise<OpportunityDeadlinesDto> {
  return apiClient<OpportunityDeadlinesDto>('/api/v1/opportunities/deadlines');
}

export async function fetchOpportunityAnalytics(): Promise<OpportunityAnalyticsDto> {
  return apiClient<OpportunityAnalyticsDto>('/api/v1/analytics/opportunities');
}
