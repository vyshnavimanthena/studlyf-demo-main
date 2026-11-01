import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class EventsController {
  public async getEvents(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Events placeholder response', { status: 'ok' }));
  }
}

export const eventsController = new EventsController();
