export class EventsRepository {
  public async findEvents(): Promise<unknown[]> {
    return [];
  }
}

export const eventsRepository = new EventsRepository();
