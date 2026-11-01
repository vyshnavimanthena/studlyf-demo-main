export class SubmissionsService {
  public async processSubmissions(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const submissionsService = new SubmissionsService();
