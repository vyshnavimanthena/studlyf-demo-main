import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class SdlController {
  public async getSdl(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Sdl placeholder response', { status: 'ok' }));
  }
}

export const sdlController = new SdlController();
