import { apiClient } from '../../lib/api-client.js';
import type {
  LearningItemDto,
  LearningMetricsDto,
  SkillDto,
  SkillDetailDto,
  CreateLearningItemInput,
  UpdateLearningItemInput,
  CreateSkillInput,
  UpdateSkillInput,
  RecordLearningActivityInput,
  LinkLearningSkillInput,
  LearningActivityDto,
  LearningItemSkillDto,
} from '@kenenisa-os/shared';

export async function fetchLearningItems(params?: {
  status?: string;
  type?: string;
  projectId?: string;
  search?: string;
}): Promise<LearningItemDto[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.type) query.set('type', params.type);
  if (params?.projectId) query.set('projectId', params.projectId);
  if (params?.search) query.set('search', params.search);

  const url = `/api/v1/learning/items${query.toString() ? `?${query.toString()}` : ''}`;
  return apiClient<LearningItemDto[]>(url);
}

export async function fetchLearningMetrics(): Promise<LearningMetricsDto> {
  return apiClient<LearningMetricsDto>('/api/v1/learning/metrics');
}

export async function fetchLearningItemById(id: string): Promise<LearningItemDto> {
  return apiClient<LearningItemDto>(`/api/v1/learning/items/${id}`);
}

export async function createLearningItem(input: CreateLearningItemInput): Promise<LearningItemDto> {
  return apiClient<LearningItemDto>('/api/v1/learning/items', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateLearningItem(
  id: string,
  input: UpdateLearningItemInput,
): Promise<LearningItemDto> {
  return apiClient<LearningItemDto>(`/api/v1/learning/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function startLearningItem(id: string): Promise<LearningItemDto> {
  return apiClient<LearningItemDto>(`/api/v1/learning/items/${id}/start`, {
    method: 'POST',
  });
}

export async function pauseLearningItem(id: string): Promise<LearningItemDto> {
  return apiClient<LearningItemDto>(`/api/v1/learning/items/${id}/pause`, {
    method: 'POST',
  });
}

export async function completeLearningItem(id: string): Promise<LearningItemDto> {
  return apiClient<LearningItemDto>(`/api/v1/learning/items/${id}/complete`, {
    method: 'POST',
  });
}

export async function reopenLearningItem(id: string): Promise<LearningItemDto> {
  return apiClient<LearningItemDto>(`/api/v1/learning/items/${id}/reopen`, {
    method: 'POST',
  });
}

export async function recordLearningActivity(
  id: string,
  input: RecordLearningActivityInput,
): Promise<LearningActivityDto> {
  return apiClient<LearningActivityDto>(`/api/v1/learning/items/${id}/activities`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function linkLearningSkill(
  id: string,
  input: LinkLearningSkillInput,
): Promise<LearningItemSkillDto> {
  return apiClient<LearningItemSkillDto>(`/api/v1/learning/items/${id}/skills`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function unlinkLearningSkill(id: string, skillId: string): Promise<void> {
  await apiClient(`/api/v1/learning/items/${id}/skills/${skillId}`, {
    method: 'DELETE',
  });
}

// ── Skills API ───────────────────────────────────────────────────────────────

export async function fetchSkills(params?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<SkillDto[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);

  const url = `/api/v1/skills${query.toString() ? `?${query.toString()}` : ''}`;
  return apiClient<SkillDto[]>(url);
}

export async function fetchSkillById(id: string): Promise<SkillDetailDto> {
  return apiClient<SkillDetailDto>(`/api/v1/skills/${id}`);
}

export async function createSkill(input: CreateSkillInput): Promise<SkillDto> {
  return apiClient<SkillDto>('/api/v1/skills', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateSkill(id: string, input: UpdateSkillInput): Promise<SkillDto> {
  return apiClient<SkillDto>(`/api/v1/skills/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function archiveSkill(id: string): Promise<SkillDto> {
  return apiClient<SkillDto>(`/api/v1/skills/${id}/archive`, {
    method: 'POST',
  });
}
