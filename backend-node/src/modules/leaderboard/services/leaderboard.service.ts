export class LeaderboardService {
  public async processLeaderboard(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const leaderboardService = new LeaderboardService();
