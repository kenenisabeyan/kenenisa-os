/**
 * Shared API response types for KENENISA OS.
 * Used by both the API (apps/api) and the frontend (apps/web).
 */

export interface ApiMeta {
  requestId?: string;
  timestamp: string;
  path?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Standard envelope for all successful API responses.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
  pagination?: PaginationMeta;
}

/**
 * Detailed error breakdown item (e.g. Zod field error).
 */
export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorDetail {
  code: string;
  details?: unknown;
}

/**
 * Standard error response envelope.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error: ApiErrorDetail;
  meta?: ApiMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Health check response shapes.
 */
export interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

export interface ReadinessData extends HealthData {
  checks: {
    database: 'connected' | 'disconnected' | 'disabled';
    memory: 'ok' | 'warning' | 'critical';
  };
}

export type HealthResponse = ApiSuccessResponse<HealthData>;
export type ReadinessResponse = ApiSuccessResponse<ReadinessData>;
