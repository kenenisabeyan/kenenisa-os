import { apiClient } from '../../lib/api-client.js';
import { DashboardDto, DashboardQuery } from '@kenenisa-os/shared';

export async function fetchDashboard(query: DashboardQuery = {}): Promise<DashboardDto> {
  const params = new URLSearchParams();
  if (query.date) params.append('date', query.date);
  if (query.timezone) params.append('timezone', query.timezone);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiClient<DashboardDto>(`/api/v1/dashboard${queryString}`);
}
