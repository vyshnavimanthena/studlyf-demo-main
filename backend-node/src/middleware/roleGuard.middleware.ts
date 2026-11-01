import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@shared/errors';

export function roleGuard(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as Request & { user?: { role: string } }).user;
    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenError('Insufficient role privileges');
    }
    next();
  };
}
