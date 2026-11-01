export class AuthService {
  public async authenticate(): Promise<{ token: string }> {
    return { token: 'placeholder_token' };
  }
}

export const authService = new AuthService();
