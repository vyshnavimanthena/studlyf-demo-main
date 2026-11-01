import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/errors';
import { logger } from '@logging/logger';
import { env } from '@config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || undefined,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  logger.error({ err }, 'Unhandled application error');

  res.status(500).json({
    success: false,
    statusCode: 500,
    message: env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
