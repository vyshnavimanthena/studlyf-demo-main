export class AuthRepository {
  public async findByEmail(_email: string): Promise<unknown | null> {
    return null;
  }
}

export const authRepository = new AuthRepository();
