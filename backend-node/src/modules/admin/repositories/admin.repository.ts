export class AdminRepository {
  public async findAdmin(): Promise<unknown[]> {
    return [];
  }
}

export const adminRepository = new AdminRepository();
