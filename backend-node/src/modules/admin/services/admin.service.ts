export class AdminService {
  public async processAdmin(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const adminService = new AdminService();
