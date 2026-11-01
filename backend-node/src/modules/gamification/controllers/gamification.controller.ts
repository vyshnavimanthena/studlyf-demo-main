import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class GamificationController {
  public async getGamification(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Gamification placeholder response', { status: 'ok' }));
  }
}

export const gamificationController = new GamificationController();
