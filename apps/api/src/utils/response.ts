import type { Response, Request } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse, PaginationMeta } from '@kenenisa-os/shared';
import { ERROR_CODES, type ErrorCode } from '@kenenisa-os/shared';

export interface SendSuccessOptions<T> {
  res: Response;
  req?: Request;
  statusCode?: number;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
}

export function sendSuccess<T>({
  res,
  req,
  statusCode = 200,
  message = 'Success',
  data,
  pagination,
}: SendSuccessOptions<T>): Response {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      requestId: req?.requestId,
      timestamp: new Date().toISOString(),
      path: req?.originalUrl,
    },
    ...(pagination && { pagination }),
  };

  return res.status(statusCode).json(payload);
}

export interface SendErrorOptions {
  res: Response;
  req?: Request;
  statusCode?: number;
  message?: string;
  code?: ErrorCode;
  details?: unknown;
}

export function sendError({
  res,
  req,
  statusCode = 500,
  message = 'An unexpected error occurred',
  code = ERROR_CODES.INTERNAL_SERVER_ERROR,
  details,
}: SendErrorOptions): Response {
  const payload: ApiErrorResponse = {
    success: false,
    message,
    error: {
      code,
      ...(details !== undefined && { details }),
    },
    meta: {
      requestId: req?.requestId,
      timestamp: new Date().toISOString(),
      path: req?.originalUrl,
    },
  };

  return res.status(statusCode).json(payload);
}
