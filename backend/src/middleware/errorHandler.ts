import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Custom API errors
  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log error
  logger.error({
    error: message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isDevelopment && { stack: err.stack }),
  });
};

