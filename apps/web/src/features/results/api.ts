import { apiClient } from '../../lib/api-client.js';
import {
  ResultOverviewDto,
  ResultTrendDto,
  ResultRecommendationDto,
  ResultAnalysisDto,
  SpreadsheetReportDto,
  PlanOutcomeDto,
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
