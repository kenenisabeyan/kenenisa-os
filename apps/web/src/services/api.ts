import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  HealthResponse,
  ApiResponse,
} from '@kenenisa-os/shared';
import { config } from '../app/config/index.js';

export class ApiError extends Error {
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly status: number;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiSuccessResponse<T>> {
  const url = `${config.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !data.success) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(
      errorData.message || 'API request failed',
      response.status,
      errorData.error?.code,
      errorData.error?.details,
    );
  }

  return data;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return apiClient('/health');
}
