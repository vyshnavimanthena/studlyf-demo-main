export class LeaderboardRepository {
  public async findLeaderboard(): Promise<unknown[]> {
    return [];
  }
}

export const leaderboardRepository = new LeaderboardRepository();
