export class JudgesService {
  public async processJudges(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const judgesService = new JudgesService();
