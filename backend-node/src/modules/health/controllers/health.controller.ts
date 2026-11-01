import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class HealthController {
  public async getHealth(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Health placeholder response', { status: 'ok' }));
  }
}

export const healthController = new HealthController();
