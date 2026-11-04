import type { ApiResponse, ApiErrorResponse } from '@kenenisa-os/shared';

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) {
    // When running in dev browser on port 5173 with Vite proxy enabled for /api,
    // prefer relative path '' so Vite seamlessly forwards to backend with native first-party cookies & no CORS friction
    if (typeof window !== 'undefined' && envUrl.includes('localhost:3000') && window.location.port === '5173') {
      return '';
    }
    return envUrl;
  }
  return '';
};

const BASE_URL = getBaseUrl();

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
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Type guard for ApiError that reliably survives module chunk splitting and transpiled prototype boundaries.
 */
export function isApiError(err: unknown): err is ApiError {
  return (
    err instanceof ApiError ||
    (typeof err === 'object' && err !== null && (err as { name?: string }).name === 'ApiError')
  );
}

export interface ApiClientOptions extends RequestInit {
  skipCache?: boolean;
  cacheTtlMs?: number;
  timeoutMs?: number;
}

// In-memory cache & in-flight request deduplication store
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

// Default cache duration for read-only GET requests (45 seconds)
const DEFAULT_CACHE_TTL_MS = 45000;

/**
 * Invalidate cached API responses by URL prefix or purge all.
 */
export function invalidateApiCache(prefix?: string): void {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(prefix)) {
      apiCache.delete(key);
    }
  }
}

/**
 * Prefetches an API endpoint into memory cache in the background (e.g. on sidebar link hover).
 */
export function prefetchApi<T>(endpoint: string): void {
  void apiClient<T>(endpoint).catch(() => {
    // Non-blocking background prefetch
  });
}

/**
 * Returns cached data synchronously if fresh, or null.
 */
export function getCachedApiData<T>(endpoint: string): T | null {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const cached = apiCache.get(url);
  if (cached && Date.now() - cached.timestamp < DEFAULT_CACHE_TTL_MS) {
    return cached.data as T;
  }
  return null;
}

export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const cacheKey = url;
  const ttl = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;

  // 1. Invalidate cache on mutations
  if (!isGet) {
    // Invalidate affected cache keys
    if (url.includes('/tasks')) {
      invalidateApiCache('/tasks');
      invalidateApiCache('/dashboard');
      invalidateApiCache('/graduation');
      invalidateApiCache('/planning');
    } else if (url.includes('/projects') || url.includes('/workstreams') || url.includes('/goals')) {
      invalidateApiCache('/projects');
      invalidateApiCache('/workstreams');
      invalidateApiCache('/goals');
      invalidateApiCache('/dashboard');
      invalidateApiCache('/graduation');
    } else {
      invalidateApiCache();
    }
  }

  // 2. Serve from memory cache for GET requests if fresh
  if (isGet && !options.skipCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }

    // 3. In-flight request deduplication: reuse active network promise
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Execute network request with deduplication tracking & bounded timeout
  const timeoutMs = options.timeoutMs ?? 12000;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  const requestPromise = (async (): Promise<T> => {
    try {
      let response: Response;
      try {
        response = await fetch(url, {
          ...options,
          signal: options.signal || abortController.signal,
          headers,
          credentials: 'include', // Critical for sending and receiving HTTP-only auth cookies
        });
      } catch (networkErr: unknown) {
        if (abortController.signal.aborted) {
          throw new ApiError(
            `Request to ${url} timed out after ${timeoutMs}ms. Please check your network or try again.`,
            408,
            'REQUEST_TIMEOUT',
          );
        }
        const errMsg = networkErr instanceof Error ? networkErr.message : 'Network request failed';
        throw new ApiError(
          errMsg === 'Failed to fetch' || errMsg.includes('NetworkError') || errMsg.includes('Failed')
            ? `Unable to connect to the backend server (${url || '/api'}). Please ensure the API server is running on port 3000.`
            : errMsg,
          0,
          'NETWORK_ERROR',
          networkErr,
        );
      }

      let data: ApiResponse<T>;
      try {
        data = (await response.json()) as ApiResponse<T>;
      } catch {
        throw new ApiError(
          `Invalid response received from server (${response.status} ${response.statusText})`,
          response.status,
          'INVALID_RESPONSE',
        );
      }

      if (!data.success || !response.ok) {
        const errorPayload = data as ApiErrorResponse;
        const errorMsg = errorPayload.message || 'An error occurred during API request';
        const errorCode = errorPayload.error?.code || 'UNKNOWN_ERROR';
        const errorDetails = errorPayload.error?.details;
        throw new ApiError(errorMsg, response.status, errorCode, errorDetails);
      }

      // Store in memory cache for GET requests
      if (isGet) {
        apiCache.set(cacheKey, { data: data.data, timestamp: Date.now() });
      }

      return data.data;
    } finally {
      clearTimeout(timeoutId);
      if (isGet) {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (isGet) {
    inFlightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}
