export class EventsService {
  public async processEvents(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const eventsService = new EventsService();
