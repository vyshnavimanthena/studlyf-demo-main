export class CareerService {
  public async processCareer(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const careerService = new CareerService();
