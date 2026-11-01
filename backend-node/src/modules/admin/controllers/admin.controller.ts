import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class AdminController {
  public async getAdmin(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Admin placeholder response', { status: 'ok' }));
  }
}

export const adminController = new AdminController();
