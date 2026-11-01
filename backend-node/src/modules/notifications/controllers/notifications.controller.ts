import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class NotificationsController {
  public async getNotifications(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Notifications placeholder response', { status: 'ok' }));
  }
}

export const notificationsController = new NotificationsController();
