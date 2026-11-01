export class NotificationsService {
  public async processNotifications(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const notificationsService = new NotificationsService();
