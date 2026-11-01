import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class SubmissionsController {
  public async getSubmissions(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Submissions placeholder response', { status: 'ok' }));
  }
}

export const submissionsController = new SubmissionsController();
