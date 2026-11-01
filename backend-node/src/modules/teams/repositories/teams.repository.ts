export class TeamsRepository {
  public async findTeams(): Promise<unknown[]> {
    return [];
  }
}

export const teamsRepository = new TeamsRepository();
