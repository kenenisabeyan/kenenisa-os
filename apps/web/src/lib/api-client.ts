import type { ApiResponse, ApiErrorResponse } from '@kenenisa-os/shared';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000';

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Critical for sending and receiving HTTP-only auth cookies
  });

  let data: ApiResponse<T>;
  try {
    data = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError('Invalid server response', response.status, 'INVALID_RESPONSE');
  }

  if (!data.success || !response.ok) {
    const errorPayload = data as ApiErrorResponse;
    const errorMsg = errorPayload.message || 'An error occurred during API request';
    const errorCode = errorPayload.error?.code || 'UNKNOWN_ERROR';
    const errorDetails = errorPayload.error?.details;
    throw new ApiError(errorMsg, response.status, errorCode, errorDetails);
  }

  return data.data;
}
