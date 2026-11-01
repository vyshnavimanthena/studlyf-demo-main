export class UsersService {
  public async processUsers(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const usersService = new UsersService();
