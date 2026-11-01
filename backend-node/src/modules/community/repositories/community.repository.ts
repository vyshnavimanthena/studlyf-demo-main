export class CommunityRepository {
  public async findCommunity(): Promise<unknown[]> {
    return [];
  }
}

export const communityRepository = new CommunityRepository();
