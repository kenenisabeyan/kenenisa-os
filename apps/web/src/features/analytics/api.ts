import { apiClient } from '../../lib/api-client.js';
import type {
  AnalyticsQuery,
  AnalyticsOverviewDto,
  ExecutionTrendPointDto,
  ProjectAnalyticsItemDto,
  GoalAnalyticsItemDto,
  WorkstreamAnalyticsItemDto,
  PlanningAnalyticsDto,
  CapacityAnalyticsDto,
  OverdueAnalyticsDto,
  BlockedAnalyticsDto,
  LearningAnalyticsDto,
  LearningTrendPointDto,
  SkillAnalyticsItemDto,
  EvidenceAnalyticsDto,
  EvidenceTrendPointDto,
  ReviewAnalyticsDto,
  WeeklyHistorySnapshotDto,
} from '@kenenisa-os/shared';

function buildQueryString(query?: AnalyticsQuery): string {
  if (!query) return '';
  const params = new URLSearchParams();
  if (query.from) params.append('from', query.from);
  if (query.to) params.append('to', query.to);
  if (query.period) params.append('period', query.period);
  if (query.granularity) params.append('granularity', query.granularity);
  const str = params.toString();
  return str ? `?${str}` : '';
}

export async function fetchAnalyticsOverview(query?: AnalyticsQuery): Promise<AnalyticsOverviewDto> {
  return apiClient<AnalyticsOverviewDto>(`/api/v1/analytics/overview${buildQueryString(query)}`);
}

export async function fetchExecutionTrend(query?: AnalyticsQuery): Promise<ExecutionTrendPointDto[]> {
  return apiClient<ExecutionTrendPointDto[]>(`/api/v1/analytics/execution/trend${buildQueryString(query)}`);
}

export async function fetchProjectAnalytics(query?: AnalyticsQuery): Promise<ProjectAnalyticsItemDto[]> {
  return apiClient<ProjectAnalyticsItemDto[]>(`/api/v1/analytics/projects${buildQueryString(query)}`);
}

export async function fetchGoalAnalytics(query?: AnalyticsQuery): Promise<GoalAnalyticsItemDto[]> {
  return apiClient<GoalAnalyticsItemDto[]>(`/api/v1/analytics/goals${buildQueryString(query)}`);
}

export async function fetchWorkstreamAnalytics(query?: AnalyticsQuery): Promise<WorkstreamAnalyticsItemDto[]> {
  return apiClient<WorkstreamAnalyticsItemDto[]>(`/api/v1/analytics/workstreams${buildQueryString(query)}`);
}

export async function fetchPlanningAnalytics(query?: AnalyticsQuery): Promise<PlanningAnalyticsDto> {
  return apiClient<PlanningAnalyticsDto>(`/api/v1/analytics/planning${buildQueryString(query)}`);
}

export async function fetchCapacityAnalytics(query?: AnalyticsQuery): Promise<CapacityAnalyticsDto> {
  return apiClient<CapacityAnalyticsDto>(`/api/v1/analytics/capacity${buildQueryString(query)}`);
}

export async function fetchOverdueAnalytics(query?: AnalyticsQuery): Promise<OverdueAnalyticsDto> {
  return apiClient<OverdueAnalyticsDto>(`/api/v1/analytics/overdue${buildQueryString(query)}`);
}

export async function fetchBlockedAnalytics(query?: AnalyticsQuery): Promise<BlockedAnalyticsDto> {
  return apiClient<BlockedAnalyticsDto>(`/api/v1/analytics/blocked${buildQueryString(query)}`);
}

export async function fetchLearningAnalytics(query?: AnalyticsQuery): Promise<LearningAnalyticsDto> {
  return apiClient<LearningAnalyticsDto>(`/api/v1/analytics/learning${buildQueryString(query)}`);
}

export async function fetchLearningTrend(query?: AnalyticsQuery): Promise<LearningTrendPointDto[]> {
  return apiClient<LearningTrendPointDto[]>(`/api/v1/analytics/learning/trend${buildQueryString(query)}`);
}

export async function fetchSkillAnalytics(query?: AnalyticsQuery): Promise<SkillAnalyticsItemDto[]> {
  return apiClient<SkillAnalyticsItemDto[]>(`/api/v1/analytics/skills${buildQueryString(query)}`);
}

export async function fetchEvidenceAnalytics(query?: AnalyticsQuery): Promise<EvidenceAnalyticsDto> {
  return apiClient<EvidenceAnalyticsDto>(`/api/v1/analytics/evidence${buildQueryString(query)}`);
}

export async function fetchEvidenceTrend(query?: AnalyticsQuery): Promise<EvidenceTrendPointDto[]> {
  return apiClient<EvidenceTrendPointDto[]>(`/api/v1/analytics/evidence/trend${buildQueryString(query)}`);
}

export async function fetchReviewAnalytics(query?: AnalyticsQuery): Promise<ReviewAnalyticsDto> {
  return apiClient<ReviewAnalyticsDto>(`/api/v1/analytics/reviews${buildQueryString(query)}`);
}

export async function fetchWeeklyHistory(query?: AnalyticsQuery): Promise<WeeklyHistorySnapshotDto[]> {
  return apiClient<WeeklyHistorySnapshotDto[]>(`/api/v1/analytics/weekly-history${buildQueryString(query)}`);
}
