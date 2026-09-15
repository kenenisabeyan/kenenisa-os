import { ERROR_CODES, type ErrorCode } from '@kenenisa-os/shared';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    details?: unknown,
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: unknown) {
    super(message, 400, ERROR_CODES.BAD_REQUEST, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 422, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: unknown) {
    super(message, 401, ERROR_CODES.UNAUTHORIZED, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: unknown) {
    super(message, 401, ERROR_CODES.AUTHENTICATED_ERROR, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden resource', details?: unknown) {
    super(message, 403, ERROR_CODES.FORBIDDEN, details);
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string = 'You are not authorized to perform this action',
    details?: unknown,
  ) {
    super(message, 403, ERROR_CODES.AUTHORIZATION_ERROR, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 404, ERROR_CODES.NOT_FOUND, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: unknown) {
    super(message, 409, ERROR_CODES.CONFLICT, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', details?: unknown) {
    super(message, 429, ERROR_CODES.TOO_MANY_REQUESTS, details);
  }
}
