export class InstitutionsService {
  public async processInstitutions(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const institutionsService = new InstitutionsService();
