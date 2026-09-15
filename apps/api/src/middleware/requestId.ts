import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { HTTP_HEADER_REQUEST_ID } from '@kenenisa-os/shared';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.header(HTTP_HEADER_REQUEST_ID);
  const requestId = existingId || randomUUID();

  req.requestId = requestId;
  res.setHeader(HTTP_HEADER_REQUEST_ID, requestId);

  next();
}
