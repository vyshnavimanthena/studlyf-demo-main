export class JudgesRepository {
  public async findJudges(): Promise<unknown[]> {
    return [];
  }
}

export const judgesRepository = new JudgesRepository();
