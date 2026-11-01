import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '@shared/errors';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token missing or invalid format');
  }

  // Placeholder user injection
  (req as Request & { user?: Record<string, unknown> }).user = {
    userId: 'placeholder-user-id',
    email: 'placeholder@studlyf.com',
    role: 'student',
  };

  next();
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    (req as Request & { user?: Record<string, unknown> }).user = {
      userId: 'placeholder-user-id',
      email: 'placeholder@studlyf.com',
      role: 'student',
    };
  }
  next();
}
