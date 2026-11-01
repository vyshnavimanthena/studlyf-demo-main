export class OpportunitiesRepository {
  public async findOpportunities(): Promise<unknown[]> {
    return [];
  }
}

export const opportunitiesRepository = new OpportunitiesRepository();
