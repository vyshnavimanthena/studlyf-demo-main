export class NotificationsRepository {
  public async findNotifications(): Promise<unknown[]> {
    return [];
  }
}

export const notificationsRepository = new NotificationsRepository();
