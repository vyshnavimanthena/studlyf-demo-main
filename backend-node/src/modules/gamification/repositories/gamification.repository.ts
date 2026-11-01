export class GamificationRepository {
  public async findGamification(): Promise<unknown[]> {
    return [];
  }
}

export const gamificationRepository = new GamificationRepository();
