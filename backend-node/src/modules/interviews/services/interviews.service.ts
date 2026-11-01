export class InterviewsService {
  public async processInterviews(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const interviewsService = new InterviewsService();
