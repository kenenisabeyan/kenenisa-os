import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../lib/logger.js';
import { ERROR_CODES } from '@kenenisa-os/shared';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId: req.requestId }, `AppError: ${err.message}`);
    } else {
      logger.warn({ err, requestId: req.requestId }, `ClientError: ${err.message}`);
    }

    return sendError({
      res,
      req,
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  logger.error({ err, requestId: req.requestId }, `Unhandled Error: ${err.message}`);

  return sendError({
    res,
    req,
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
  });
}

export function notFoundHandler(req: Request, res: Response): Response {
  return sendError({
    res,
    req,
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: ERROR_CODES.NOT_FOUND,
  });
}
