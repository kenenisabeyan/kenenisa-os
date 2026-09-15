import { apiClient } from '../../lib/api-client.js';
import type {
  EvidenceDto,
  CreateEvidenceInput,
  UpdateEvidenceInput,
  EvidenceQuery,
} from '@kenenisa-os/shared';

export async function fetchEvidenceList(query?: EvidenceQuery): Promise<EvidenceDto[]> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', String(query.page));
  if (query?.pageSize) params.append('pageSize', String(query.pageSize));
  if (query?.type) params.append('type', query.type);
  if (query?.search) params.append('search', query.search);
  if (query?.projectId) params.append('projectId', query.projectId);
  if (query?.taskId) params.append('taskId', query.taskId);
  if (query?.learningItemId) params.append('learningItemId', query.learningItemId);
  if (query?.skillId) params.append('skillId', query.skillId);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiClient<EvidenceDto[]>(`/api/v1/evidence${queryString}`);
}

export async function fetchEvidenceById(id: string): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>(`/api/v1/evidence/${id}`);
}

export async function createEvidence(input: CreateEvidenceInput): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>('/api/v1/evidence', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateEvidence(id: string, input: UpdateEvidenceInput): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>(`/api/v1/evidence/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteEvidence(id: string): Promise<{ deleted: boolean }> {
  return apiClient<{ deleted: boolean }>(`/api/v1/evidence/${id}`, {
    method: 'DELETE',
  });
}

export async function linkEvidenceTask(evidenceId: string, taskId: string): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>(`/api/v1/evidence/${evidenceId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ taskId }),
  });
}

export async function unlinkEvidenceTask(evidenceId: string, taskId: string): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>(`/api/v1/evidence/${evidenceId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export async function linkEvidenceProject(evidenceId: string, projectId: string): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>(`/api/v1/evidence/${evidenceId}/projects`, {
    method: 'POST',
    body: JSON.stringify({ projectId }),
  });
}

export async function unlinkEvidenceProject(evidenceId: string, projectId: string): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>(`/api/v1/evidence/${evidenceId}/projects/${projectId}`, {
    method: 'DELETE',
  });
}

export async function linkEvidenceLearningItem(evidenceId: string, learningItemId: string): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>(`/api/v1/evidence/${evidenceId}/learning-items`, {
    method: 'POST',
    body: JSON.stringify({ learningItemId }),
  });
}

export async function unlinkEvidenceLearningItem(evidenceId: string, learningItemId: string): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>(`/api/v1/evidence/${evidenceId}/learning-items/${learningItemId}`, {
    method: 'DELETE',
  });
}

export async function linkEvidenceSkill(evidenceId: string, skillId: string): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>(`/api/v1/evidence/${evidenceId}/skills`, {
    method: 'POST',
    body: JSON.stringify({ skillId }),
  });
}

export async function unlinkEvidenceSkill(evidenceId: string, skillId: string): Promise<EvidenceDto> {
  return apiClient<EvidenceDto>(`/api/v1/evidence/${evidenceId}/skills/${skillId}`, {
    method: 'DELETE',
  });
}
