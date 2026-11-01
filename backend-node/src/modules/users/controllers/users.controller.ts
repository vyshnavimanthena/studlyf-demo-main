import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class UsersController {
  public async getUsers(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Users placeholder response', { status: 'ok' }));
  }
}

export const usersController = new UsersController();
