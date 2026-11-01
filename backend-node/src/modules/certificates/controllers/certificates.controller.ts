import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class CertificatesController {
  public async getCertificates(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Certificates placeholder response', { status: 'ok' }));
  }
}

export const certificatesController = new CertificatesController();
