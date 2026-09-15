import { apiClient } from '../../lib/api-client.js';
import type {
  WeeklyReviewDto,
  CreateWeeklyReviewInput,
  UpdateWeeklyReviewInput,
  WeeklyReviewContextDto,
  WeeklyReviewQuery,
} from '@kenenisa-os/shared';

export async function fetchWeeklyReviews(query?: WeeklyReviewQuery): Promise<WeeklyReviewDto[]> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', String(query.page));
  if (query?.pageSize) params.append('pageSize', String(query.pageSize));
  if (query?.status) params.append('status', query.status);
  if (query?.weekStart) params.append('weekStart', query.weekStart);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiClient<WeeklyReviewDto[]>(`/api/v1/reviews/weekly${queryString}`);
}

export async function fetchWeeklyReviewById(id: string): Promise<WeeklyReviewDto> {
  return apiClient<WeeklyReviewDto>(`/api/v1/reviews/weekly/${id}`);
}

export async function fetchWeeklyReviewContext(weekStart?: string): Promise<WeeklyReviewContextDto> {
  const query = weekStart ? `?weekStart=${encodeURIComponent(weekStart)}` : '';
  return apiClient<WeeklyReviewContextDto>(`/api/v1/reviews/weekly/context${query}`);
}

export async function createWeeklyReview(input: CreateWeeklyReviewInput): Promise<WeeklyReviewDto> {
  return apiClient<WeeklyReviewDto>('/api/v1/reviews/weekly', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateWeeklyReview(id: string, input: UpdateWeeklyReviewInput): Promise<WeeklyReviewDto> {
  return apiClient<WeeklyReviewDto>(`/api/v1/reviews/weekly/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function completeWeeklyReview(id: string): Promise<WeeklyReviewDto> {
  return apiClient<WeeklyReviewDto>(`/api/v1/reviews/weekly/${id}/complete`, {
    method: 'POST',
  });
}

export async function reopenWeeklyReview(id: string): Promise<WeeklyReviewDto> {
  return apiClient<WeeklyReviewDto>(`/api/v1/reviews/weekly/${id}/reopen`, {
    method: 'POST',
  });
}
