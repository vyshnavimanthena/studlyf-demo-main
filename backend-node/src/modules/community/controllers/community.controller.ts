import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class CommunityController {
  public async getCommunity(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Community placeholder response', { status: 'ok' }));
  }
}

export const communityController = new CommunityController();
