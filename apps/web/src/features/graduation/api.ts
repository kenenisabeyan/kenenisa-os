import { apiClient } from '../../lib/api-client.js';
import type { GraduationOverviewDto } from '@kenenisa-os/shared';

export async function fetchGraduationOverview(): Promise<GraduationOverviewDto> {
  const res = await apiClient<{ overview: GraduationOverviewDto }>('/api/v1/graduation/overview');
  return res.overview;
}

export async function initializeGraduationWorkspace(): Promise<void> {
  await apiClient('/api/v1/graduation/initialize', {
    method: 'POST',
  });
}

export async function updateGraduationSettings(input: {
  graduationTargetDate?: string | null;
  dailyWorkCapacityMinutes?: number;
}): Promise<void> {
  await apiClient('/api/v1/graduation/settings', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

