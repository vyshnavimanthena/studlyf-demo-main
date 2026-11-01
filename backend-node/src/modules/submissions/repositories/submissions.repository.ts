export class SubmissionsRepository {
  public async findSubmissions(): Promise<unknown[]> {
    return [];
  }
}

export const submissionsRepository = new SubmissionsRepository();
