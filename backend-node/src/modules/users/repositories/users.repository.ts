export class UsersRepository {
  public async findUsers(): Promise<unknown[]> {
    return [];
  }
}

export const usersRepository = new UsersRepository();
