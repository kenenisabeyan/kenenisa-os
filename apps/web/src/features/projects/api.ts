import { apiClient } from '../../lib/api-client.js';
import {
  ProjectDto,
  ProjectQuery,
  createProjectSchema,
  updateProjectSchema,
} from '@kenenisa-os/shared';
import { z } from 'zod';

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type UpdateProjectInput = z.input<typeof updateProjectSchema>;

export async function fetchProjects(query: ProjectQuery = {}): Promise<ProjectDto[]> {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.pageSize) params.append('pageSize', String(query.pageSize));
  if (query.workstreamId) params.append('workstreamId', query.workstreamId);
  if (query.goalId) params.append('goalId', query.goalId);
  if (query.status) params.append('status', query.status);
  if (query.priority) params.append('priority', query.priority);
  if (query.search) params.append('search', query.search);
  if (query.archived !== undefined) params.append('archived', String(query.archived));
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiClient<ProjectDto[]>(`/api/v1/projects${queryString}`);
}

export async function createProject(input: CreateProjectInput): Promise<ProjectDto> {
  return apiClient<ProjectDto>('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<ProjectDto> {
  return apiClient<ProjectDto>(`/api/v1/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function archiveProject(id: string): Promise<ProjectDto> {
  return apiClient<ProjectDto>(`/api/v1/projects/${id}/archive`, {
    method: 'POST',
  });
}

export async function completeProject(id: string): Promise<ProjectDto> {
  return apiClient<ProjectDto>(`/api/v1/projects/${id}/complete`, {
    method: 'POST',
  });
}

export async function reopenProject(id: string): Promise<ProjectDto> {
  return apiClient<ProjectDto>(`/api/v1/projects/${id}/reopen`, {
    method: 'POST',
  });
}
