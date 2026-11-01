import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class TeamsController {
  public async getTeams(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Teams placeholder response', { status: 'ok' }));
  }
}

export const teamsController = new TeamsController();
