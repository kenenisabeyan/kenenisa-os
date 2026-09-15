/**
 * Shared API response types for KENENISA OS.
 * Used by both the API (apps/api) and the frontend (apps/web).
 */

/**
 * Standard envelope for all API responses.
 * Every endpoint returns either a success or error envelope.
 */
export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Response shape for GET /api/health
 */
export interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
}

export type HealthResponse = ApiResponse<HealthData>;

/**
 * Standard error response shape.
 */
export interface ApiError {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: unknown;
  };
}
