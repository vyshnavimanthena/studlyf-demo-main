import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class JudgesController {
  public async getJudges(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Judges placeholder response', { status: 'ok' }));
  }
}

export const judgesController = new JudgesController();
