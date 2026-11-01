export class HealthRepository {
  public async findHealth(): Promise<unknown[]> {
    return [];
  }
}

export const healthRepository = new HealthRepository();
