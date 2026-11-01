import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class InstitutionsController {
  public async getInstitutions(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Institutions placeholder response', { status: 'ok' }));
  }
}

export const institutionsController = new InstitutionsController();
