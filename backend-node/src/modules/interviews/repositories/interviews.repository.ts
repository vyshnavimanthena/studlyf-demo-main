export class InterviewsRepository {
  public async findInterviews(): Promise<unknown[]> {
    return [];
  }
}

export const interviewsRepository = new InterviewsRepository();
