import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { logger } from '../lib/logger.js';
import { ERROR_CODES } from '@kenenisa-os/shared';
import { Prisma } from '@prisma/client';

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

  // Handle known Prisma Database errors safely
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn({ errCode: err.code, requestId: req.requestId }, `PrismaError [${err.code}]: ${err.message}`);

    if (err.code === 'P2002') {
      return sendError({
        res,
        req,
        statusCode: 409,
        message: 'A record with matching unique fields already exists.',
        code: ERROR_CODES.CONFLICT,
      });
    }

    if (err.code === 'P2025') {
      return sendError({
        res,
        req,
        statusCode: 404,
        message: 'The requested resource was not found.',
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    if (err.code === 'P2003') {
      return sendError({
        res,
        req,
        statusCode: 400,
        message: 'Invalid relationship reference in request.',
        code: ERROR_CODES.BAD_REQUEST,
      });
    }
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
