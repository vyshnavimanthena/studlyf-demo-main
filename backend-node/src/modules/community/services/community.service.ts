export class CommunityService {
  public async processCommunity(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const communityService = new CommunityService();
