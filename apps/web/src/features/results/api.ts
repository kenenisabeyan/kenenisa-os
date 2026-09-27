import { apiClient } from '../../lib/api-client.js';
import {
  ResultOverviewDto,
  ResultTrendDto,
  ResultRecommendationDto,
  ResultAnalysisDto,
  SpreadsheetReportDto,
  PlanOutcomeDto,
  ResultTimelineEntryDto,
  PeriodComparisonDto,
  WorkstreamResultBreakdownDto,
  ProjectResultBreakdownDto,
  CapacityTimeAnalysisDto,
} from '@kenenisa-os/shared';

function buildQueryString(params?: Record<string, string>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

export async function fetchResultOverview(params?: Record<string, string>): Promise<ResultOverviewDto> {
  return apiClient<ResultOverviewDto>(`/api/v1/results/overview${buildQueryString(params)}`);
}

export async function fetchResultTrends(params?: Record<string, string>): Promise<ResultTrendDto[]> {
  return apiClient<ResultTrendDto[]>(`/api/v1/results/trends${buildQueryString(params)}`);
}

export async function fetchResultRecommendations(): Promise<ResultRecommendationDto[]> {
  return apiClient<ResultRecommendationDto[]>('/api/v1/results/recommendations');
}

export async function fetchResultAnalysis(params?: Record<string, string>): Promise<ResultAnalysisDto> {
  return apiClient<ResultAnalysisDto>(`/api/v1/results/analysis${buildQueryString(params)}`);
}

export async function fetchDetailedResults(params?: Record<string, string>): Promise<{ items: PlanOutcomeDto[]; pagination: any }> {
  return apiClient<{ items: PlanOutcomeDto[]; pagination: any }>(`/api/v1/results${buildQueryString(params)}`);
}

export async function fetchResultTimeline(params?: Record<string, string>): Promise<ResultTimelineEntryDto[]> {
  return apiClient<ResultTimelineEntryDto[]>(`/api/v1/results/timeline${buildQueryString(params)}`);
}

export async function fetchPeriodComparison(scope = 'week'): Promise<PeriodComparisonDto> {
  return apiClient<PeriodComparisonDto>(`/api/v1/results/comparison?scope=${scope}`);
}

export async function fetchWorkstreamBreakdown(): Promise<WorkstreamResultBreakdownDto[]> {
  return apiClient<WorkstreamResultBreakdownDto[]>('/api/v1/results/workstreams');
}

export async function fetchProjectBreakdown(): Promise<ProjectResultBreakdownDto[]> {
  return apiClient<ProjectResultBreakdownDto[]>('/api/v1/results/projects');
}

export async function fetchCapacityAnalysis(): Promise<CapacityTimeAnalysisDto> {
  return apiClient<CapacityTimeAnalysisDto>('/api/v1/results/capacity-analysis');
}

export async function fetchSpreadsheetPreview(params?: Record<string, string>): Promise<SpreadsheetReportDto> {
  return apiClient<SpreadsheetReportDto>(`/api/v1/results/export/preview${buildQueryString(params)}`);
}

export async function downloadXlsxReport(params?: Record<string, string>): Promise<void> {
  const url = `/api/v1/results/export/xlsx${buildQueryString(params)}`;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `kenenisa-os-results-${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
