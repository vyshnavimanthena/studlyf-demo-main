import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class OpportunitiesController {
  public async getOpportunities(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Opportunities placeholder response', { status: 'ok' }));
  }
}

export const opportunitiesController = new OpportunitiesController();
