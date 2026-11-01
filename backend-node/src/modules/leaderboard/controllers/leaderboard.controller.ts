import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class LeaderboardController {
  public async getLeaderboard(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Leaderboard placeholder response', { status: 'ok' }));
  }
}

export const leaderboardController = new LeaderboardController();
