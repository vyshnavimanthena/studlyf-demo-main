import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class AuthController {
  public async login(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('Login placeholder successful', { token: 'placeholder_jwt' }));
  }

  public async signup(_req: Request, res: Response): Promise<void> {
    res.status(201).json(formatResponse('Signup placeholder successful', { userId: 'placeholder_id' }));
  }
}

export const authController = new AuthController();
