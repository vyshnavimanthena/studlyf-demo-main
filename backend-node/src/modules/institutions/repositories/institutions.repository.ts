export class InstitutionsRepository {
  public async findInstitutions(): Promise<unknown[]> {
    return [];
  }
}

export const institutionsRepository = new InstitutionsRepository();
