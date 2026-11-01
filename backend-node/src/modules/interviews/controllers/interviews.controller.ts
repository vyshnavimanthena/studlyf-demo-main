import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class InterviewsController {
  public async getInterviews(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Interviews placeholder response', { status: 'ok' }));
  }
}

export const interviewsController = new InterviewsController();
