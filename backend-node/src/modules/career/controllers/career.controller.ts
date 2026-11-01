import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class CareerController {
  public async getCareer(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Career placeholder response', { status: 'ok' }));
  }
}

export const careerController = new CareerController();
